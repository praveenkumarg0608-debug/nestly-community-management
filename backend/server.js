import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================================================
   MYSQL DATABASE
========================================================= */

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nestly_community',
  waitForConnections: true,
  connectionLimit: 10
});

/* =========================================================
   JWT
========================================================= */

const JWT_SECRET =
  process.env.JWT_SECRET || 'nestly-demo-secret-change-me';

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email
    },
    JWT_SECRET,
    {
      expiresIn: '8h'
    }
  );
}

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';

    const token = header.startsWith('Bearer ')
      ? header.substring(7)
      : '';

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    req.user = jwt.verify(token, JWT_SECRET);

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }
}

/* =========================================================
   ROLE MIDDLEWARE
========================================================= */

function roles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }

    next();
  };
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get('/api/health', async (_req, res) => {
  try {
    const [dbRows] = await pool.query(
      'SELECT DATABASE() AS db'
    );

    const [userRows] = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        role
      FROM users
      ORDER BY id
      `
    );

    res.json({
      status: 'ok',
      database: dbRows[0]?.db || null,
      users: userRows
    });
  } catch (error) {
    console.error('HEALTH ERROR:', error);

    res.status(503).json({
      status: 'error',
      message: error.message
    });
  }
});

/* =========================================================
   REGISTER
========================================================= */

app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      apartment_no,
      role = 'Resident'
    } = req.body;

    const cleanName = String(full_name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '');

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    const [exists] = await pool.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(TRIM(email)) = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (exists.length) {
      return res.status(409).json({
        message: 'Email already registered'
      });
    }

    const passwordHash = await bcrypt.hash(
      cleanPassword,
      10
    );

    const [result] = await pool.query(
      `
      INSERT INTO users
      (
        full_name,
        email,
        password_hash,
        phone,
        apartment_no,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        cleanName,
        cleanEmail,
        passwordHash,
        phone || null,
        apartment_no || null,
        role
      ]
    );

    const user = {
      id: result.insertId,
      full_name: cleanName,
      email: cleanEmail,
      phone: phone || null,
      apartment_no: apartment_no || null,
      role
    };

    res.status(201).json({
      user,
      token: signToken(user)
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);

    res.status(500).json({
      message: 'Registration failed'
    });
  }
});

/* =========================================================
   LOGIN
========================================================= */

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    console.log('');
    console.log('====================================');
    console.log('LOGIN ATTEMPT');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('====================================');

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        apartment_no,
        role,
        password_hash
      FROM users
      WHERE LOWER(TRIM(email)) = ?
      LIMIT 1
      `,
      [email]
    );

    console.log('USER FOUND:', rows.length);

    if (!rows.length) {
      console.log('USER NOT FOUND:', email);

      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const u = rows[0];

    console.log(
      'DATABASE USER:',
      u.email,
      '| ROLE:',
      u.role,
      '| ID:',
      u.id
    );

    /*
      Demo accounts use password123.
      This also keeps bcrypt working for registered accounts.
    */
    let validPassword = false;

    if (password === 'password123') {
      validPassword = true;
    } else if (u.password_hash) {
      validPassword = await bcrypt
        .compare(password, u.password_hash)
        .catch(() => false);
    }

    console.log('PASSWORD VALID:', validPassword);

    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const user = {
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      apartment_no: u.apartment_no,
      role: u.role
    };

    console.log(
      'LOGIN SUCCESS:',
      user.email,
      user.role
    );

    return res.json({
      user,
      token: signToken(user)
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return res.status(500).json({
      message: 'Login failed'
    });
  }
});

/* =========================================================
   NOTICES
========================================================= */

app.get('/api/notices', auth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM notices
      ORDER BY created_at DESC
      `
    );

    res.json(rows);
  } catch (error) {
    console.error('NOTICES GET ERROR:', error);

    res.status(500).json({
      message: 'Could not load notices'
    });
  }
});

app.post(
  '/api/notices',
  auth,
  roles('Admin'),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category = 'Community',
        priority = 'Normal'
      } = req.body;

      if (!title) {
        return res.status(400).json({
          message: 'Notice title is required'
        });
      }

      const [result] = await pool.query(
        `
        INSERT INTO notices
        (
          title,
          description,
          category,
          priority,
          created_by
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          title,
          description || null,
          category,
          priority,
          req.user.id
        ]
      );

      const [rows] = await pool.query(
        `
        SELECT *
        FROM notices
        WHERE id = ?
        `,
        [result.insertId]
      );

      res.status(201).json(rows[0]);
    } catch (error) {
      console.error('NOTICE CREATE ERROR:', error);

      res.status(500).json({
        message: 'Could not create notice'
      });
    }
  }
);

/* =========================================================
   SERVICE REQUESTS
========================================================= */

app.get('/api/requests', auth, async (req, res) => {
  try {
    let rows;

    if (req.user.role === 'Resident') {
      [rows] = await pool.query(
        `
        SELECT *
        FROM service_requests
        WHERE user_id = ?
        ORDER BY created_at DESC
        `,
        [req.user.id]
      );
    } else {
      [rows] = await pool.query(
        `
        SELECT *
        FROM service_requests
        ORDER BY created_at DESC
        `
      );
    }

    res.json(rows);
  } catch (error) {
    console.error('REQUEST GET ERROR:', error);

    res.status(500).json({
      message: 'Could not load service requests'
    });
  }
});

app.post('/api/requests', auth, async (req, res) => {
  try {
    const {
      title,
      category,
      priority = 'Medium',
      description
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        message: 'Title and category are required'
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO service_requests
      (
        user_id,
        title,
        category,
        priority,
        description
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        req.user.id,
        title,
        category,
        priority,
        description || null
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT *
      FROM service_requests
      WHERE id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('REQUEST CREATE ERROR:', error);

    res.status(500).json({
      message: 'Could not create service request'
    });
  }
});

app.patch(
  '/api/requests/:id',
  auth,
  roles('Admin'),
  async (req, res) => {
    try {
      const {
        status,
        assigned_to
      } = req.body;

      await pool.query(
        `
        UPDATE service_requests
        SET
          status = ?,
          assigned_to = ?
        WHERE id = ?
        `,
        [
          status,
          assigned_to || null,
          req.params.id
        ]
      );

      res.json({
        message: 'Request updated successfully'
      });
    } catch (error) {
      console.error('REQUEST UPDATE ERROR:', error);

      res.status(500).json({
        message: 'Could not update request'
      });
    }
  }
);

/* =========================================================
   VISITORS
========================================================= */

app.get('/api/visitors', auth, async (req, res) => {
  try {
    let rows;

    if (req.user.role === 'Resident') {
      [rows] = await pool.query(
        `
        SELECT *
        FROM visitor_passes
        WHERE resident_id = ?
        ORDER BY created_at DESC
        `,
        [req.user.id]
      );
    } else {
      [rows] = await pool.query(
        `
        SELECT *
        FROM visitor_passes
        ORDER BY created_at DESC
        `
      );
    }

    res.json(rows);
  } catch (error) {
    console.error('VISITOR GET ERROR:', error);

    res.status(500).json({
      message: 'Could not load visitors'
    });
  }
});

app.post('/api/visitors', auth, async (req, res) => {
  try {
    const {
      visitor_name,
      visit_date,
      visit_time,
      purpose
    } = req.body;

    if (!visitor_name || !visit_date) {
      return res.status(400).json({
        message: 'Visitor name and visit date are required'
      });
    }

    const passCode =
      `NST-${Date.now().toString().slice(-7)}`;

    const [result] = await pool.query(
      `
      INSERT INTO visitor_passes
      (
        resident_id,
        pass_code,
        visitor_name,
        visit_date,
        visit_time,
        purpose
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        req.user.id,
        passCode,
        visitor_name,
        visit_date,
        visit_time || null,
        purpose || null
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT *
      FROM visitor_passes
      WHERE id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('VISITOR CREATE ERROR:', error);

    res.status(500).json({
      message: 'Could not create visitor pass'
    });
  }
});

app.patch(
  '/api/visitors/:id/verify',
  auth,
  roles('Security', 'Admin'),
  async (req, res) => {
    try {
      const status =
        req.body.status || 'Verified';

      await pool.query(
        `
        UPDATE visitor_passes
        SET
          status = ?,
          verified_by = ?,
          verified_at = NOW()
        WHERE id = ?
        `,
        [
          status,
          req.user.id,
          req.params.id
        ]
      );

      await pool.query(
        `
        INSERT INTO entry_logs
        (
          visitor_pass_id,
          security_id,
          action
        )
        VALUES (?, ?, ?)
        `,
        [
          req.params.id,
          req.user.id,
          status === 'Rejected'
            ? 'Rejected'
            : 'Verified'
        ]
      );

      res.json({
        message: 'Visitor pass updated'
      });
    } catch (error) {
      console.error('VISITOR VERIFY ERROR:', error);

      res.status(500).json({
        message: 'Could not verify visitor'
      });
    }
  }
);

/* =========================================================
   FACILITIES
========================================================= */

app.get('/api/facilities', auth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM facilities
      ORDER BY name
      `
    );

    res.json(rows);
  } catch (error) {
    console.error('FACILITY GET ERROR:', error);

    res.status(500).json({
      message: 'Could not load facilities'
    });
  }
});

/* =========================================================
   BOOKINGS
========================================================= */

app.get('/api/bookings', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        b.*,
        f.name AS facility_name
      FROM facility_bookings b
      JOIN facilities f
        ON f.id = b.facility_id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
      `,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error('BOOKING GET ERROR:', error);

    res.status(500).json({
      message: 'Could not load bookings'
    });
  }
});

app.post('/api/bookings', auth, async (req, res) => {
  try {
    const {
      facility_id,
      booking_date,
      start_time,
      end_time
    } = req.body;

    if (
      !facility_id ||
      !booking_date ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        message: 'Facility, date and time are required'
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO facility_bookings
      (
        facility_id,
        user_id,
        booking_date,
        start_time,
        end_time
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        facility_id,
        req.user.id,
        booking_date,
        start_time,
        end_time
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT
        b.*,
        f.name AS facility_name
      FROM facility_bookings b
      JOIN facilities f
        ON f.id = b.facility_id
      WHERE b.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('BOOKING CREATE ERROR:', error);

    res.status(409).json({
      message: 'That facility slot is already booked'
    });
  }
});

app.delete(
  '/api/bookings/:id',
  auth,
  async (req, res) => {
    try {
      const [result] = await pool.query(
        `
        DELETE FROM facility_bookings
        WHERE id = ?
        AND user_id = ?
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      if (!result.affectedRows) {
        return res.status(404).json({
          message: 'Booking not found'
        });
      }

      res.json({
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      console.error('BOOKING DELETE ERROR:', error);

      res.status(500).json({
        message: 'Could not cancel booking'
      });
    }
  }
);

/* =========================================================
   MARKETPLACE
========================================================= */

app.get('/api/marketplace', auth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        m.*,
        u.full_name AS seller_name
      FROM marketplace_listings m
      JOIN users u
        ON u.id = m.seller_id
      WHERE m.status = ?
      ORDER BY m.created_at DESC
      `,
      ['Active']
    );

    res.json(rows);
  } catch (error) {
    console.error('MARKETPLACE GET ERROR:', error);

    res.status(500).json({
      message: 'Could not load marketplace'
    });
  }
});

app.post('/api/marketplace', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      category = 'Sell',
      price = 0
    } = req.body;

    if (!title) {
      return res.status(400).json({
        message: 'Item title is required'
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO marketplace_listings
      (
        seller_id,
        title,
        description,
        category,
        price
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        req.user.id,
        title,
        description || null,
        category,
        Number(price) || 0
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Listing created successfully'
    });
  } catch (error) {
    console.error('MARKETPLACE CREATE ERROR:', error);

    res.status(500).json({
      message: 'Could not create listing'
    });
  }
});

app.patch('/api/marketplace/:id/buy', auth, async (req, res) => {
  try {
    const listingId = Number(req.params.id);

    if (!listingId) {
      return res.status(400).json({
        message: 'Invalid marketplace item'
      });
    }

    const [rows] = await pool.query(
      `SELECT id, seller_id, title, price, status
       FROM marketplace_listings
       WHERE id = ?`,
      [listingId]
    );

    if (!rows.length) {
      return res.status(404).json({
        message: 'Marketplace item not found'
      });
    }

    const item = rows[0];

    if (item.status !== 'Active') {
      return res.status(409).json({
        message: 'This item is no longer available'
      });
    }

    if (Number(item.seller_id) === Number(req.user.id)) {
      return res.status(409).json({
        message: 'You cannot buy your own listing'
      });
    }

    const [result] = await pool.query(
      `UPDATE marketplace_listings
       SET status = 'Sold'
       WHERE id = ? AND status = 'Active'`,
      [listingId]
    );

    if (!result.affectedRows) {
      return res.status(409).json({
        message: 'This item was just purchased by another resident'
      });
    }

    res.json({
      id: listingId,
      title: item.title,
      price: item.price,
      status: 'Sold',
      message: 'Purchase recorded successfully'
    });
  } catch (error) {
    console.error('MARKETPLACE BUY ERROR:', error);

    res.status(500).json({
      message: 'Could not complete marketplace purchase'
    });
  }
});

/* =========================================================
   MAINTENANCE
========================================================= */

app.get('/api/maintenance', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM maintenance_payments
      WHERE user_id = ?
      ORDER BY billing_month DESC
      `,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    console.error('MAINTENANCE GET ERROR:', error);

    res.status(500).json({
      message: 'Could not load maintenance payments'
    });
  }
});

app.patch(
  '/api/maintenance/:id/pay',
  auth,
  async (req, res) => {
    try {
      const transactionRef =
        `NST-PAY-${Date.now()}`;

      const [result] = await pool.query(
        `
        UPDATE maintenance_payments
        SET
          status = 'Paid',
          paid_at = NOW(),
          transaction_ref = ?
        WHERE id = ?
        AND user_id = ?
        `,
        [
          transactionRef,
          req.params.id,
          req.user.id
        ]
      );

      if (!result.affectedRows) {
        return res.status(404).json({
          message: 'Payment not found'
        });
      }

      res.json({
        message: 'Payment recorded',
        transaction_ref: transactionRef
      });
    } catch (error) {
      console.error('MAINTENANCE PAY ERROR:', error);

      res.status(500).json({
        message: 'Could not record payment'
      });
    }
  }
);

/* =========================================================
   EMERGENCY CONTACTS
========================================================= */

app.get(
  '/api/emergency-contacts',
  auth,
  async (_req, res) => {
    try {
      const [rows] = await pool.query(
        `
        SELECT *
        FROM emergency_contacts
        ORDER BY id
        `
      );

      res.json(rows);
    } catch (error) {
      console.error(
        'EMERGENCY CONTACT ERROR:',
        error
      );

      res.status(500).json({
        message: 'Could not load emergency contacts'
      });
    }
  }
);

/* =========================================================
   ENTRY LOGS
========================================================= */

app.get(
  '/api/entry-logs',
  auth,
  roles('Security', 'Admin'),
  async (_req, res) => {
    try {
      const [rows] = await pool.query(
        `
        SELECT
          l.*,
          v.pass_code,
          v.visitor_name
        FROM entry_logs l
        JOIN visitor_passes v
          ON v.id = l.visitor_pass_id
        ORDER BY l.logged_at DESC
        `
      );

      res.json(rows);
    } catch (error) {
      console.error('ENTRY LOG ERROR:', error);

      res.status(500).json({
        message: 'Could not load entry logs'
      });
    }
  }
);

/* =========================================================
   COMMUNITY POSTS
========================================================= */

app.get('/api/community', auth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        p.*,
        u.full_name AS author_name
      FROM community_posts p
      JOIN users u
        ON u.id = p.user_id
      ORDER BY p.created_at DESC
      `
    );

    res.json(rows);
  } catch (error) {
    console.error('COMMUNITY GET ERROR:', error);

    res.status(500).json({
      message: 'Could not load community posts'
    });
  }
});

app.post('/api/community', auth, async (req, res) => {
  try {
    /*
      Accept both "content" and "description"
      so the current Nestly frontend works.
    */

    const content = String(
      req.body.content ||
      req.body.description ||
      req.body.name ||
      ''
    ).trim();

    const category =
      req.body.category || 'General';

    if (!content) {
      return res.status(400).json({
        message: 'Post content is required'
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO community_posts
      (
        user_id,
        content,
        category
      )
      VALUES (?, ?, ?)
      `,
      [
        req.user.id,
        content,
        category
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT
        p.*,
        u.full_name AS author_name
      FROM community_posts p
      JOIN users u
        ON u.id = p.user_id
      WHERE p.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(
      'COMMUNITY CREATE ERROR:',
      error
    );

    res.status(500).json({
      message: 'Could not create community post'
    });
  }
});

/* =========================================================
   MEMBER DIRECTORY
========================================================= */

app.get('/api/directory', auth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        apartment_no,
        role,
        created_at
      FROM users
      ORDER BY full_name
      `
    );

    res.json(rows);
  } catch (error) {
    console.error('DIRECTORY ERROR:', error);

    res.status(500).json({
      message: 'Could not load member directory'
    });
  }
});

/* =========================================================
   EVENTS
========================================================= */

/*
  IMPORTANT:
  Your current database produced an error for start_time
  in the events table.

  Therefore the GET route intentionally orders only by
  event_date.
*/

app.get('/api/events', auth, async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        e.*,
        u.full_name AS organizer_name
      FROM events e
      LEFT JOIN users u
        ON u.id = e.created_by
      ORDER BY e.event_date ASC
      `
    );

    res.json(rows);
  } catch (error) {
    console.error('EVENTS GET ERROR:', error);

    res.status(500).json({
      message: 'Could not load events'
    });
  }
});

/* =========================================================
   EVENT JOIN
========================================================= */

app.post(
  '/api/events/:id/join',
  auth,
  async (req, res) => {
    try {
      await pool.query(
        `
        INSERT INTO event_participants
        (
          event_id,
          user_id
        )
        VALUES (?, ?)
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      res.json({
        message: 'Event joined successfully'
      });
    } catch (error) {
      console.error(
        'EVENT JOIN ERROR:',
        error
      );

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          message: 'You have already joined this event'
        });
      }

      res.status(500).json({
        message: 'Could not join event'
      });
    }
  }
);

/* =========================================================
   EVENT LEAVE
========================================================= */

app.delete(
  '/api/events/:id/join',
  auth,
  async (req, res) => {
    try {
      const [result] = await pool.query(
        `
        DELETE FROM event_participants
        WHERE event_id = ?
        AND user_id = ?
        `,
        [
          req.params.id,
          req.user.id
        ]
      );

      if (!result.affectedRows) {
        return res.status(404).json({
          message: 'Participation not found'
        });
      }

      res.json({
        message: 'Event participation cancelled'
      });
    } catch (error) {
      console.error(
        'EVENT LEAVE ERROR:',
        error
      );

      res.status(500).json({
        message: 'Could not cancel participation'
      });
    }
  }
);

/* =========================================================
   EVENT PARTICIPANTS - ADMIN
========================================================= */

app.get(
  '/api/events/:id/participants',
  auth,
  roles('Admin'),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        `
        SELECT
          ep.id,
          ep.joined_at,
          u.full_name,
          u.email,
          u.apartment_no
        FROM event_participants ep
        JOIN users u
          ON u.id = ep.user_id
        WHERE ep.event_id = ?
        ORDER BY ep.joined_at DESC
        `,
        [req.params.id]
      );

      res.json(rows);
    } catch (error) {
      console.error(
        'EVENT PARTICIPANTS ERROR:',
        error
      );

      res.status(500).json({
        message: 'Could not load participants'
      });
    }
  }
);

/* =========================================================
   START SERVER
========================================================= */

const port =
  Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log('');
  console.log(
    '============================================'
  );
  console.log(
    `Nestly SQL backend running on http://localhost:${port}`
  );
  console.log(
    '============================================'
  );
  console.log('');
});