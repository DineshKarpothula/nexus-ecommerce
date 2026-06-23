import jwt from 'jsonwebtoken'

const generateToken = (userId, role) => jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' })

export default generateToken