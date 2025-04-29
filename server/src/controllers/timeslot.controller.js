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
    try {
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
    } catch (error) {
        console.error('Error fetching timeslots:', error);
        res.status(500).json({ error: 'Failed to retrieve timeslots' });
    }
});

// Reserve a timeslot (set as temporarily reserved)
publicRouter.post('/timeslots/:id/reserve', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if timeslot exists and is available
        const timeslot = await db.get('SELECT * FROM timeslots WHERE timeslot_id = ? AND booked = 0', [id]);
        
        if (!timeslot) {
            return res.status(404).json({ error: 'Timeslot not found or already booked' });
        }
        
        // Mark as reserved in the model (not in DB yet)
        const reserved = model.reserveTimeslot(id);
        
        if (!reserved) {
            return res.status(409).json({ error: 'Timeslot is already reserved or booked' });
        }
        
        // Notify all connected clients about the reservation
        model.io.emit('timeslot:reserved', { id });
        
        // Set a timeout to clear the reservation if not confirmed
        setTimeout(async () => {
            const current = await db.get('SELECT * FROM timeslots WHERE timeslot_id = ?', [id]);
            
            // If still not booked after timeout, clear the reservation
            if (current && current.booked === 0) {
                model.releaseTimeslot(id);
                model.io.emit('timeslot:released', { id });
            }
        }, 10000); // 10 seconds
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error reserving timeslot:', error);
        res.status(500).json({ error: 'Failed to reserve timeslot' });
    }
});

// Book a timeslot
publicRouter.post('/timeslots/:id/book', async (req, res) => {
    const { id } = req.params;
    const { studentName } = req.body;
    
    if (!studentName || studentName.trim() === '') {
        return res.status(400).json({ error: 'Student name is required' });
    }
    
    try {
        // Verify timeslot is reserved and not booked
        const isReserved = model.isTimeslotReserved(id);
        
        if (!isReserved) {
            return res.status(409).json({ error: 'Timeslot is not reserved or already booked' });
        }
        
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
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error booking timeslot:', error);
        res.status(500).json({ error: 'Failed to book timeslot' });
    }
});

// Cancel a reservation
publicRouter.post('/timeslots/:id/cancel', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Release the reservation in the model
        const released = model.releaseTimeslot(id);
        
        if (!released) {
            return res.status(404).json({ error: 'Timeslot not found or not reserved' });
        }
        
        // Notify all connected clients
        model.io.emit('timeslot:released', { id });
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error canceling reservation:', error);
        res.status(500).json({ error: 'Failed to cancel reservation' });
    }
});

// Private routes for assistants
privateRouter.post('/timeslots', requireAuth, async (req, res) => {
    const { time } = req.body;
    const { id } = req.session;
    
    if (!time || time.trim() === '') {
        return res.status(400).json({ error: 'Time is required' });
    }
    
    try {
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
        
        res.status(201).json({ 
            id: timeslotId,
            time,
            assistantId: assistant
        });
    } catch (error) {
        console.error('Error creating timeslot:', error);
        res.status(500).json({ error: 'Failed to create timeslot' });
    }
});

privateRouter.delete('/timeslots/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { id: sessionId } = req.session;
    
    try {
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
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error deleting timeslot:', error);
        res.status(500).json({ error: 'Failed to delete timeslot' });
    }
});

export default {
    publicRouter,
    privateRouter,
    requireAuth
};