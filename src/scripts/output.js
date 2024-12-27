function toInitials(name) {
  let initials = "";
  const words = name.split(" ");
  words.forEach((word) => {
    initials += word.slice(0, 1).toUpperCase();
  });
  return initials;
}
