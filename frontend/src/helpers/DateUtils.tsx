export const formatDateToMonthYr = (date: string) => {
    const dateOnly = date.split('#').pop() || ''
    //from date in format yyyyMMdd get year from it and month from it
    const year = dateOnly.slice(0, 4);
    const month = dateOnly.slice(4, 6);
    const day = dateOnly.slice(6, 8);
    const dateObject = new Date(`${year}-${month}-${day}`)
    //get month and year only from dateObject
    const dateLocale = dateObject.toLocaleString('es-ES', { month: 'long', timeZone: 'UTC' })
    const monthName = dateLocale.toUpperCase().charAt(0) + dateLocale.slice(1)
    return `${monthName} ${year}`
  }

  
  export const formatDateToLongFormat = (date: string) => {
    const dateOnly = date.split('T')[0];
    // const dateOnly = date.split('#').pop() || ''
    const dateObject = new Date(dateOnly)
    const dateLocale = dateObject.toLocaleString('es-ES', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    })
    return `${dateLocale}`
  }

  export const formatDateToMonthYearFormat = (date: Date) => {
    // console.log("formatDateToMonthYearFormat", JSON.stringify(date));
    const dateLocale = date.toLocaleString('es-ES',  {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
    return `${dateLocale}`
  }