export function ticketDTO(ticket) {
  if (!ticket) return null;

  const plain = typeof ticket.toObject === 'function' ? ticket.toObject() : ticket;

  const event =
    plain.event && typeof plain.event === 'object' && plain.event.title
      ? {
          id: plain.event._id?.toString() ?? plain.event.id,
          title: plain.event.title,
          date: plain.event.date,
          location: plain.event.location,
          price: plain.event.price,
          status: plain.event.status,
        }
      : plain.event?.toString();

  const user =
    plain.user && typeof plain.user === 'object' && plain.user.email
      ? {
          id: plain.user._id?.toString() ?? plain.user.id,
          first_name: plain.user.first_name,
          last_name: plain.user.last_name,
          email: plain.user.email,
        }
      : plain.user?.toString();

  return {
    id: plain._id?.toString() ?? plain.id,
    event,
    user,
    quantity: plain.quantity,
    status: plain.status,
    reservationCode: plain.reservationCode,
    createdAt: plain.createdAt,
    cancelledAt: plain.cancelledAt,
  };
}

export function ticketListDTO(tickets) {
  return tickets.map(ticketDTO);
}
