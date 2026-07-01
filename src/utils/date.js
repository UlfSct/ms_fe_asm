export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getFaceFullName = (face) => {
  if (!face) return '-'
  let lastname = face.lastname ? ` ${face.lastname}` : ''
  return `${face.surname} ${face.name}${lastname}`
}
