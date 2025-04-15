import { Router } from 'express'
import db from '../db.js'
import sessionManager from '../sessionManager.js'
import { readFile, resolvePath } from '../util.js'
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

const requireAuth = (req, res, next) => {
    const { id } = req.session;
    const { user } = model.findUserById(id);
    if (user === undefined){
        rest.status(401).end();
        return;
    }
    next();
}

router.get();







// Defines a route for the GET /login request
publicRouter.get('/login', async (req, res) => {
  console.log(req.body)
  // FIXME
  const htmlDoc = await readFile(resolvePath('public', 'login.html'))
  res.status(200).send(htmlDoc)
})

// Defines a route for handling the login form submission
publicRouter.post('/login', async (req, res) => {
  const sendErrorResponse = async (errorMessage) => {
    const htmlDoc = await readFile(resolvePath('public', 'login.html'))
    const modifiedHtml = htmlDoc
      .replace(
        'class="alert alert-danger d-none"',
        'class="alert alert-danger"'
      )
      .replace('></div>', `>${errorMessage}</div>`)
    // .replace('placeholder="Username"', `placeholder="Username" value="${username}"`)
    res.status(200).send(modifiedHtml)
  }

  console.log(req.body)

  // FIXME
  const { username, password } = req.body

  /*
  db.each('SELECT * FROM users', (err, row) => {
    if (err) {
      throw new Error(err)
    }
    console.log(`${row.id}: ${row.info}`)
  })
  */

  // FIXME
  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [
      username,
    ])

    if (user === undefined || password !== user.password) {
      return await sendErrorResponse('Invalid username or password')
    }

    const session = sessionManager.createNewSession(user)
    console.log('Created session:', session)
    
    // Sets a cookie in the browser with the session ID
    res.cookie('session-id', session.id).redirect('/profile')
  } catch (error) {
    console.error('Login error:', error)
    return await sendErrorResponse('Internal server error')
  }
})

privateRouter.post('/logout', (req, res) => {
  console.log(req.body)

  // FIXME
  const sessionId = req.cookies['session-id']

  if (sessionId) {
    sessionManager.deleteSession(sessionId)
  }

  // res.redirect('/login?error=FIXME')
  res.clearCookie('session-id').redirect('/login')
})

export default {
  publicRouter,
  privateRouter,
}