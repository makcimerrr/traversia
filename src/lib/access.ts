import type { Access, PayloadRequest } from "payload"

/**
 * Règles d'accès. Deux populations se connectent : les administrateurs
 * (collection `users`, back-office) et les clients (collection `customers`,
 * site et application mobile). Un client ne voit que ce qui le concerne.
 */

export const isAdmin = (req: PayloadRequest): boolean => req.user?.collection === "users"

export const isCustomer = (req: PayloadRequest): boolean => req.user?.collection === "customers"

export const adminOnly: Access = ({ req }) => isAdmin(req)

/** Clients : leur propre fiche. Administrateurs : tout. */
export const adminOrSelf: Access = ({ req }) => {
  if (isAdmin(req)) return true
  if (isCustomer(req) && req.user) return { id: { equals: req.user.id } }
  return false
}

/** Clients : leurs propres réservations. Administrateurs : tout. */
export const adminOrOwnBookings: Access = ({ req }) => {
  if (isAdmin(req)) return true
  if (isCustomer(req) && req.user) return { customer: { equals: req.user.id } }
  return false
}
