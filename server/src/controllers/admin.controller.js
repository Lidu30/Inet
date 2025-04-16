import { Router } from 'express'
import db from '../db.js'
import model from "../model.js";

const publicRouter = Router()
const privateRouter = Router()


/**
 * requireAuth is a middleware function that limit access to an endpoint to authenticated users.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns {void}
 */

const  requireAuth = (req, res, next) => {
    const { id } = req.session;
    const assistant = model.findAssistantById(id);
    if( assistant === undefined){
        res.status(401).json({error: "Not authenticated"});
    } else {
        next();
    }
}


// Defines a route for handling the login form submission
publicRouter.post('/login', async (req, res) => {
  const { username } = req.body;
  const { password } = req.body;
  
  const validPassword =
        /[a-zA-Z]/.test(password) && /\d/.test(password);
      const validUsername =
        /[a-zA-Z]/.test(username) && /\d/.test(username);

  if(!validUsername){
    return res.status(400).json({
        error: "Username must be at least 3 characters and contain at least one letter or number "})
  }
  if(!validPassword){
    return res.status(400).json({
        error: "Password must be at least 3 characters and contain at least one letter or number "})
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [
      username,
    ])

    if (user === undefined || password !== user.password) {
      return res.status(401).json({ error: 'Invalid username or password' }); 
    }
    const sessionId = req.session.id;
    model.createAssistant(username, sessionId);
    req.session.save((err) =>{
        if (err) console.error(err);
        else console.debug(`Saved user: ${JSON.stringify(model.findAssistantBy(id))}`);
    });

    res.status(200).json({authenticated: true}); 
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
})

export default {
  publicRouter,
  privateRouter,
}