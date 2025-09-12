const express = require('express');
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const requireAdmin = (req, res, next) => {
	if (!req.user || req.user.account_type !== 'admin') {
		return res.status(403).json({ message: 'Admin only' });
	}
	next();
};

	// Configure multer for company logo uploads
	const logoStorage = multer.diskStorage({
		destination: (req, file, cb) => {
			const uploadDir = path.join(__dirname, '../uploads/companies');
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}
			cb(null, uploadDir);
		},
		filename: (req, file, cb) => {
			const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
			cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
		},
	});

	const imageFileFilter = (req, file, cb) => {
		const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
		if (allowed.includes(file.mimetype)) cb(null, true);
		else cb(new Error('Only image files (png, jpg, jpeg, webp) are allowed for logo'), false);
	};

	const uploadLogo = multer({
		storage: logoStorage,
		fileFilter: imageFileFilter,
		limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
	});

	// Upload company logo (public)
	router.post('/upload-logo', uploadLogo.single('logo'), async (req, res) => {
		try {
			if (!req.file) {
				return res.status(400).json({ message: 'No logo file uploaded' });
			}
			const file_url = `/uploads/companies/${req.file.filename}`;
			return res.status(201).json({ message: 'Logo uploaded', file_url });
		} catch (err) {
			console.error('Upload logo error:', err);
			return res.status(500).json({ message: 'Server error' });
		}
	});

// Helper: generate 10-digit numeric tax code
function randomDigits(length = 10) {
	let s = '';
	for (let i = 0; i < length; i++) s += Math.floor(Math.random() * 10);
	return s;
}

async function generateUniqueTaxCode(maxAttempts = 12) {
	for (let i = 0; i < maxAttempts; i++) {
		const candidate = randomDigits(10);
		const { rows } = await pool.query('SELECT 1 FROM companies WHERE tax_code = $1', [candidate]);
		if (rows.length === 0) return candidate;
	}
	throw new Error('Không thể sinh mã số thuế duy nhất, vui lòng thử lại.');
}

// Helper: generate 10-char uppercase alphanumeric company code
function randomCode(length = 10) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let s = '';
	for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
	return s;
}

async function generateUniqueCompanyCode(maxAttempts = 12) {
	for (let i = 0; i < maxAttempts; i++) {
		const candidate = randomCode(10);
		const { rows } = await pool.query('SELECT 1 FROM companies WHERE code = $1', [candidate]);
		if (rows.length === 0) return candidate;
	}
	throw new Error('Không thể sinh mã công ty duy nhất, vui lòng thử lại.');
}

// Create company (public), defaults to pending; tax_code will be generated on acceptance
router.post('/', async (req, res) => {
	try {
		const { name, legal_name, address, contact_phone, logo_url, email } = req.body;
		if (!name || !address || !email) {
			return res.status(400).json({ message: 'name, address and email are required' });
		}
		const { rows } = await pool.query(
			`INSERT INTO companies (name, legal_name, tax_code, address, contact_phone, logo_url, email)
			 VALUES ($1,$2,NULL,$3,$4,$5,$6)
			 RETURNING id, name, legal_name, tax_code, address, contact_phone, logo_url, email, code, status, created_at`,
			[name, legal_name || null, address, contact_phone || null, logo_url || null, email]
		);
		return res.status(201).json({ message: 'Company created, pending review', company: rows[0] });
	} catch (err) {
		console.error('Create company error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// List companies (admin can view any status; others only accepted)
router.get('/', authenticateToken, async (req, res) => {
	try {
		const { status = 'accepted' } = req.query;
		if (status !== 'accepted' && req.user.account_type !== 'admin') {
			return res.status(403).json({ message: 'Admin only' });
		}
		let rows;
		if (status === 'all') {
			const result = await pool.query(
				`SELECT id, name, legal_name, tax_code, address, contact_phone, logo_url, email, code, status,
						reviewed_by_user_id, review_note, reviewed_at, created_at, updated_at
				 FROM companies
				 ORDER BY created_at DESC`
			);
			rows = result.rows;
		} else {
			const result = await pool.query(
				`SELECT id, name, legal_name, tax_code, address, contact_phone, logo_url, email, code, status,
						reviewed_by_user_id, review_note, reviewed_at, created_at, updated_at
				 FROM companies
				 WHERE status = $1
				 ORDER BY created_at DESC`,
				[status]
			);
			rows = result.rows;
		}
		return res.json({ companies: rows });
	} catch (err) {
		console.error('List companies error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// Public lookup by tax code (for registration guidance)
router.get('/by-tax/:taxCode', async (req, res) => {
	try {
		const { taxCode } = req.params;
		const { rows } = await pool.query(
			`SELECT id, name, legal_name, tax_code, status FROM companies WHERE tax_code = $1`,
			[taxCode]
		);
		if (rows.length === 0) return res.status(404).json({ message: 'Company not found' });
		return res.json({ company: rows[0] });
	} catch (err) {
		console.error('Get company by tax error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// Public get company by id (basic fields)
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { rows } = await pool.query(
			`SELECT id, name, legal_name, tax_code, address, contact_phone, logo_url, email, code, status,
					reviewed_by_user_id, review_note, reviewed_at, created_at, updated_at
			 FROM companies WHERE id = $1`,
			[id]
		);
		if (rows.length === 0) return res.status(404).json({ message: 'Company not found' });
		return res.json({ company: rows[0] });
	} catch (err) {
		console.error('Get company by id error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// Review company (admin)
router.patch('/:id/review', authenticateToken, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const { status, review_note } = req.body;
		if (!['accepted','rejected','pending'].includes(status)) {
			return res.status(400).json({ message: 'Invalid status' });
		}
	const { rows } = await pool.query(
			`UPDATE companies
			 SET status = $1,
					 reviewed_by_user_id = $2,
					 review_note = $3,
					 reviewed_at = NOW(),
					 updated_at = NOW()
			 WHERE id = $4
	     RETURNING id, name, legal_name, tax_code, address, contact_phone, logo_url, email, code, status,
		       reviewed_by_user_id, review_note, reviewed_at, created_at, updated_at`,
			[status, req.user.id, review_note || null, id]
		);
		if (rows.length === 0) return res.status(404).json({ message: 'Company not found' });

		// If accepted and tax_code is null, generate a unique 10-digit tax_code
		let company = rows[0];
		if (company.status === 'accepted') {
			let changed = false;
			// Ensure tax_code
			if (company.tax_code === null || company.tax_code === undefined) {
				for (let attempt = 0; attempt < 12; attempt++) {
					const candidate = await generateUniqueTaxCode();
					try {
						const up = await pool.query(
							`UPDATE companies SET tax_code = $1, updated_at = NOW() WHERE id = $2 AND tax_code IS NULL RETURNING tax_code`,
							[candidate, id]
						);
						if (up.rows.length) {
							changed = true;
							break;
						} else {
							// Maybe set concurrently; stop trying
							break;
						}
					} catch (e) {
						if (e && e.code !== '23505') throw e; // retry on unique violation
					}
				}
			}
			// Ensure company code
			if (company.code === null || company.code === undefined) {
				for (let attempt = 0; attempt < 12; attempt++) {
					const candidate = await generateUniqueCompanyCode();
					try {
						const up = await pool.query(
							`UPDATE companies SET code = $1, updated_at = NOW() WHERE id = $2 AND code IS NULL RETURNING code`,
							[candidate, id]
						);
						if (up.rows.length) {
							changed = true;
							break;
						} else {
							// Maybe set concurrently; stop trying
							break;
						}
					} catch (e) {
						if (e && e.code !== '23505') throw e;
					}
				}
			}
			if (changed) {
				const refetch = await pool.query(
					`SELECT id, name, legal_name, tax_code, address, contact_phone, logo_url, email, code, status,
							reviewed_by_user_id, review_note, reviewed_at, created_at, updated_at
					 FROM companies WHERE id = $1`,
					[id]
				);
				company = refetch.rows[0] || company;
			}
		}

		return res.json({ message: 'Company reviewed', company });
	} catch (err) {
		console.error('Review company error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;
// Admin: Update basic company info
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		const { name, legal_name, address, contact_phone, logo_url } = req.body;
		// Disallow manual MST (tax_code) edits
		if (Object.prototype.hasOwnProperty.call(req.body, 'tax_code')) {
			return res.status(400).json({ message: 'Mã số thuế được hệ thống sinh tự động khi chấp nhận và không cho phép chỉnh sửa' });
		}

		// Fetch current company
		const current = await pool.query(
			`SELECT id, name, legal_name, tax_code, address, contact_phone, logo_url, status FROM companies WHERE id = $1`,
			[id]
		);
		if (current.rows.length === 0) return res.status(404).json({ message: 'Company not found' });

		// Only allow updates when status is 'accepted'
		if (current.rows[0].status !== 'accepted') {
			return res.status(400).json({ message: 'Chỉ được sửa nội dung của công ty khi trạng thái là đã được chấp nhận' });
		}

		// If updating logo_url, optionally remove old local file
		let finalLogo = logo_url === undefined ? current.rows[0].logo_url : (logo_url || null);
		const oldLogo = current.rows[0].logo_url;
		const willReplaceLogo = finalLogo !== oldLogo && oldLogo && oldLogo.startsWith('/uploads/companies/');

		const result = await pool.query(
			`UPDATE companies
			 SET name = COALESCE($1, name),
					 legal_name = COALESCE($2, legal_name),
					 address = COALESCE($3, address),
					 contact_phone = COALESCE($4, contact_phone),
					 logo_url = COALESCE($5, logo_url),
					 updated_at = NOW()
			 WHERE id = $6
			 RETURNING id, name, legal_name, tax_code, address, contact_phone, logo_url, email, code, status, reviewed_by_user_id, review_note, reviewed_at, created_at, updated_at`,
			[name || null, legal_name || null, address || null, contact_phone || null, finalLogo, id]
		);

		// Delete old logo file if replaced
		if (willReplaceLogo) {
			try {
				const oldPath = path.join(__dirname, '..', oldLogo);
				if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
			} catch (e) {
				console.warn('Failed to delete old logo:', e.message);
			}
		}

		return res.json({ message: 'Cập nhật công ty thành công', company: result.rows[0] });
	} catch (err) {
		console.error('Update company error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// Admin: Delete company (only if no references)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
	try {
		const { id } = req.params;
		// Ensure exists
		const compRes = await pool.query('SELECT id, logo_url FROM companies WHERE id = $1', [id]);
		if (compRes.rows.length === 0) return res.status(404).json({ message: 'Company not found' });

		// Check references
		const userCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM users WHERE company_id = $1', [id]);
		const postCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM posts WHERE company_id = $1', [id]);
		const refs = (userCountRes.rows[0]?.count || 0) + (postCountRes.rows[0]?.count || 0);
		if (refs > 0) {
			return res.status(400).json({ message: 'Không thể xoá công ty vì đang được tham chiếu bởi người dùng hoặc bài đăng' });
		}

		// Delete row
		await pool.query('DELETE FROM companies WHERE id = $1', [id]);

		// Remove logo file if local
		const logo = compRes.rows[0].logo_url;
		if (logo && logo.startsWith('/uploads/companies/')) {
			try {
				const filePath = path.join(__dirname, '..', logo);
				if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
			} catch (e) {
				console.warn('Failed to delete logo file:', e.message);
			}
		}

		return res.json({ message: 'Đã xoá công ty' });
	} catch (err) {
		console.error('Delete company error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

