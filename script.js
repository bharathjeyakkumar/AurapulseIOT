function calculateAge() {
    const birthdate = document.getElementById('birthday').value;
    const resultElement = document.getElementById('result');

    if (!birthdate) {
        resultElement.innerHTML = "Please select a date first!";
        return;
    }

    const birthDate = new Date(birthdate);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjustment logic if current month/day is before birth month/day
    if (months < 0 || (months === 0 && days < 0)) {
        years--;
        months += 12;
    }
    
    if (days < 0) {
        const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += lastMonth.getDate();
        months--;
    }

    resultElement.innerHTML = `
        <p>You are exactly:</p>
        <span>${years} Years, ${months} Months, and ${days} Days old</span>
    `;
}
