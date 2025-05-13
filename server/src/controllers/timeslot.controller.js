import { Router } from 'express';
import db from '../db.js';
import model from "../model.js";

const publicRouter = Router();
const privateRouter = Router();

/**
 * requireAuth is a middleware function that limits access to an endpoint to authenticated users.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns {void}
 */
const requireAuth = (req, res, next) => {
    const { id } = req.session;
    const assistant = model.findAssistantById(id);
    if (assistant === undefined) {
        res.status(401).json({ error: "Not authenticated" });
    } else {
        next();
    }
};

// Public routes for students to access timeslots
publicRouter.get('/timeslots', async (req, res) => {
    
    const timeslots = await db.all(`
        SELECT t.timeslot_id, t.assistant_id, t.time, t.booked, t.booked_by
        FROM timeslots t
        ORDER BY t.time
    `);
    
    // Format the response for the client
    const formattedTimeslots = timeslots.map(slot => ({
        id: slot.timeslot_id,
        assistantId: slot.assistant_id,
        time: slot.time,
        booked: slot.booked === 1,
        bookedBy: slot.booked_by
    }));
    
    res.status(200).json({ timeslots: formattedTimeslots });
   
});

// Reserve a timeslot (set as temporarily reserved)
publicRouter.post('/timeslots/:id/reserve', async (req, res) => {
    const { id } = req.params;

    // Check if timeslot exists and is available
    const timeslot = await db.get('SELECT * FROM timeslots WHERE timeslot_id = ? AND booked = 0', [id]);
    

    // We probably would not need this part-check later
    if (!timeslot) {
        return res.status(403).json({ error: 'Timeslot is already booked or rserved' });
    }
    
    // Mark as reserved in the model (not in DB yet)
    const reserved = model.reserveTimeslot(id);
    
    if (!reserved) {
        return res.status(403).json({ error: 'Timeslot is already reserved or booked' });
    }
    
    // Notify all connected clients about the reservation
    model.io.emit('timeslot:reserved', { id });
    
    // Set a timeout to clear the reservation if not confirmed in the server side-this is also done in the client side
    setTimeout(async () => {
        const currentTimeslot = await db.get('SELECT * FROM timeslots WHERE timeslot_id = ?', [id]);
        
        // If still not booked after timeout, clear the reservation
        if (currentTimeslot && currentTimeslot.booked === 0) {
            model.releaseTimeslot(id);
            model.io.emit('timeslot:released', { id });
        }
    }, 10000); // 10 seconds
    
    return res.status(200).json({ success: true });
    
});

// Book a timeslot
publicRouter.post('/timeslots/:id/book', async (req, res) => {
    const { id } = req.params;
    const { studentName } = req.body;
    
    if (!studentName || studentName.trim() === '') {
        return res.status(400).json({ error: 'Student name is required' });
    }
    
    // Verify timeslot is reserved and not booked
    // const isReserved = model.isTimeslotReserved(id);
    
    // We probably would not need this because the user would be directed to the timeslots immediately after the time has run out 
    // if (!isReserved) {
        // return res.status(403).json({ error: 'Timeslot is not reserved' });
    // }
    
    // Update the database
    await db.run(
        'UPDATE timeslots SET booked = 1, booked_by = ? WHERE timeslot_id = ?',
        [studentName, id]
    );
    
    // Update the model and release reservation
    model.bookTimeslot(id, studentName);
    
    // Notify all clients about the booking
    model.io.emit('timeslot:booked', { 
        id, 
        studentName 
    });
    
    return res.status(200).json({ success: true });
   
});

// Cancel a reservation
publicRouter.post('/timeslots/:id/cancel', async (req, res) => {
    const { id } = req.params;
   
    // Release the reservation in the model
    const released = model.releaseTimeslot(id);
    
    if (!released) {
        return res.status(404).json({ error: 'Timeslot not found or not reserved' });
    }
    
    // Notify all connected clients
    model.io.emit('timeslot:released', { id });
    
    return res.status(200).json({ success: true });
    
});

// Not sure about this, but assistants should have Private routes when they try to book?
privateRouter.post('/timeslots', requireAuth, async (req, res) => {
    const { time } = req.body;
    const { id } = req.session;
    
    if (!time || time.trim() === '') {
        return res.status(400).json({ error: 'Time is required' });
    }
    
    // Get the assistant info
    const assistant = model.findAssistantById(id);
    
    // Check if the timeslot already exists for this assistant
    const existing = await db.get(
        'SELECT * FROM timeslots WHERE assistant_id = ? AND time = ?',
        [assistant, time]
    );
    
    if (existing) {
        return res.status(409).json({ error: 'Timeslot already exists' });
    }
    
    // Insert the new timeslot
    const result = await db.run(
        'INSERT INTO timeslots (assistant_id, time, booked, booked_by) VALUES (?, ?, 0, NULL)',
        [assistant, time]
    );
    
    const timeslotId = result.lastID;
    
    // Update the model
    model.createTimeslot(timeslotId, assistant, time);
    
    // Notify all connected clients
    model.io.emit('timeslot:created', { 
        id: timeslotId,
        assistantId: assistant,
        time,
        booked: false
    });
    
    return res.status(201).json({ 
        id: timeslotId,
        time,
        assistantId: assistant
    });
    
});

privateRouter.delete('/timeslots/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { id: sessionId } = req.session;
    
   
    // Get the assistant info
    const assistant = model.findAssistantById(sessionId);
    
    // Check if the timeslot exists and belongs to this assistant
    const timeslot = await db.get(
        'SELECT * FROM timeslots WHERE timeslot_id = ? AND assistant_id = ?',
        [id, assistant]
    );
    
    if (!timeslot) {
        return res.status(404).json({ error: 'Timeslot not found or not owned by you' });
    }
    
    // Delete the timeslot
    await db.run('DELETE FROM timeslots WHERE timeslot_id = ?', [id]);
    
    // Update the model
    model.removeTimeslot(id);
    
    // Notify all connected clients
    model.io.emit('timeslot:deleted', { id });
    
    return res.status(200).json({ success: true });
   
});

export default {
    publicRouter,
    privateRouter,
    requireAuth
};