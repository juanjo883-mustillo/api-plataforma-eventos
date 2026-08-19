// Constantes de dominio compartidas. Viven fuera de models/ a propósito:
// los modelos de Mongoose solo deben importarse desde dao/, así que cualquier
// otra capa (services, controllers) que necesite estos valores los toma de acá.

export const USER_ROLES = ['user', 'organizer', 'admin'];

export const EVENT_STATUSES = ['draft', 'published', 'cancelled', 'finished'];

export const TICKET_STATUSES = ['active', 'cancelled'];
