export function userDTO(user) {
  if (!user) return null;

  const plain = typeof user.toObject === 'function' ? user.toObject() : user;

  return {
    id: plain._id?.toString() ?? plain.id,
    first_name: plain.first_name,
    last_name: plain.last_name,
    email: plain.email,
    role: plain.role,
  };
}
