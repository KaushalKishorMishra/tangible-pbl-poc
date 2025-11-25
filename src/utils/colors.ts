export const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getColorByLabel = (label: string) => {
  switch (label) {
    case "Skill":
      return "#FA4F40"; // Red
    case "Role":
      return "#5A4F40"; // Brownish
    case "Resource":
      return "#40FA4F"; // Green
    case "Assessment":
      return "#404FFA"; // Blue
    case "Person":
      return "#FA40FA"; // Pink
    case "Tool":
      return "#40FAFA"; // Cyan
    default:
      return getRandomColor();
  }
};
