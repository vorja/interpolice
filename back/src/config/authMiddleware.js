import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Token requerido" });

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ error: "Token inválido o expirado" });
    req.user = payload; // { id, usuario, rol_id, iat, exp }
    next();
  });
}

export function requireAdmin(req, res, next) {
  if (req.user?.rol_id !== 1) return res.status(403).json({ error: "Acceso denegado" });
  next();
}