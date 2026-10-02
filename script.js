// ==========================================
// GOOGLE APPS SCRIPT URL
// ==========================================

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycby9upbLZou9ar3eGXbKBO6HxPeCywQMvvtgbHDDz1uHmpX-nnif1cWUxjDzw6LCiDbXwg/exec";


// ==========================================
// DAYS
// ==========================================

const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday"
];


// ==========================================
// TIME SLOTS
// ==========================================

const timeSlots = [
    "8:00 AM - 9:30 AM",
    "9:40 AM - 11:10 AM",
    "11:20 AM - 12:50 PM",
    "1:00 PM - 2:30 PM",
    "2:40 PM - 4:10 PM",
    "4:20 PM - 5:50 PM"
];


// ==========================================
// CREATE TIMETABLE
// ==========================================

const timetable =
    document.getElementById("timetable");


days.forEach(day => {

    const daySection =
        document.createElement("div");


    daySection.className =
        "day-section";


    daySection.innerHTML = `

        <div class="day-title">
            ${day}
        </div>

        <div
            class="slots"
            id="${day}-slots">
        </div>

    `;


    timetable.appendChild(
        daySection
    );


    const slotContainer =
        document.getElementById(
            `${day}-slots`
        );


    timeSlots.forEach(time => {

        const slot =
            document.createElement("div");


        slot.className =
            "slot";


        slot.innerText =
            time;


        slot.dataset.day =
            day;


        slot.dataset.time =
            time;


        slot.addEventListener(
            "click",
            function () {

                slot.classList.toggle(
                    "selected"
                );


                calculateFreeTime();

            }
        );


        slotContainer.appendChild(
            slot
        );

    });

});


// ==========================================
// CALCULATE FREE TIME
// ==========================================

function calculateFreeTime() {

    const freeTimeDiv =
        document.getElementById(
            "freeTime"
        );


    freeTimeDiv.innerHTML = "";


    days.forEach(day => {

        const selectedSlots =
            document.querySelectorAll(
                `.slot[data-day="${day}"].selected`
            );


        const selectedTimes = [];


        selectedSlots.forEach(slot => {

            selectedTimes.push(
                slot.dataset.time
            );

        });


        const freeTimes =
            timeSlots.filter(
                time =>
                    !selectedTimes.includes(
                        time
                    )
            );


        const dayDiv =
            document.createElement(
                "div"
            );


        dayDiv.className =
            "free-day";


        dayDiv.innerHTML = `

            <strong>
                ${day}
            </strong>

            ${
                freeTimes.length > 0
                    ? freeTimes.join(", ")
                    : "No free time"
            }

        `;


        freeTimeDiv.appendChild(
            dayDiv
        );

    });

}


// ==========================================
// GET FREE TIME
// ==========================================

function getFreeTime(day) {

    const selectedSlots =
        document.querySelectorAll(
            `.slot[data-day="${day}"].selected`
        );


    const selectedTimes = [];


    selectedSlots.forEach(slot => {

        selectedTimes.push(
            slot.dataset.time
        );

    });


    const freeTimes =
        timeSlots.filter(
            time =>
                !selectedTimes.includes(
                    time
                )
        );


    return freeTimes.join(", ");

}


// ==========================================
// SUBMIT BUTTON
// ==========================================

const submitBtn =
    document.getElementById(
        "submitBtn"
    );


submitBtn.addEventListener(
    "click",
    async function () {


        // Prevent multiple clicks

        if (
            submitBtn.disabled
        ) {
            return;
        }


        const name =
            document
                .getElementById("name")
                .value
                .trim();


        const studentId =
            document
                .getElementById("studentId")
                .value
                .trim();


        const department =
            document
                .getElementById("department")
                .value;


        const phone =
            document
                .getElementById("phone")
                .value
                .trim();


        const note =
            document
                .getElementById("note")
                .value
                .trim();


        // ======================================
        // VALIDATION
        // ======================================

        if (!name) {

            alert(
                "Please enter your name."
            );

            return;

        }


        if (!studentId) {

            alert(
                "Please enter your Student ID."
            );

            return;

        }


        if (!department) {

            alert(
                "Please select your department."
            );

            return;

        }


        if (!phone) {

            alert(
                "Please enter your phone number."
            );

            return;

        }


        // ======================================
        // DISABLE BUTTON
        // ======================================

        submitBtn.disabled = true;

        submitBtn.innerText =
            "Submitting...";


        // ======================================
        // PREPARE DATA
        // ======================================

        const data = {

            name: name,

            studentId: studentId,

            department: department,

            phone: phone,

            sunday:
                getFreeTime("Sunday"),

            monday:
                getFreeTime("Monday"),

            tuesday:
                getFreeTime("Tuesday"),

            wednesday:
                getFreeTime("Wednesday"),

            note: note

        };


        // ======================================
        // SEND DATA
        // ======================================

        try {

            const formData =
                new URLSearchParams();


            formData.append(
                "payload",
                JSON.stringify(data)
            );


            const response =
                await fetch(
                    GOOGLE_SCRIPT_URL,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const result =
                await response.json();


            // ==================================
            // DUPLICATE STUDENT ID
            // ==================================

            if (
                result.duplicate
            ) {

                alert(
                    "This Student ID has already submitted.\n\n" +
                    "One Student ID can submit only once."
                );


                submitBtn.disabled =
                    false;


                submitBtn.innerText =
                    "Submit Availability";


                return;

            }


            // ==================================
            // SUCCESS
            // ==================================

            if (
                result.success
            ) {

                submitBtn.innerText =
                    "Submitted ✓";


                submitBtn.style.background =
                    "#16a34a";


                showSuccessMessage();


                resetForm();


                startCountdown();

            }


            else {

                throw new Error(
                    result.message ||
                    "Submission failed."
                );

            }


        } catch (error) {

            console.error(error);


            alert(
                "Could not submit the form.\n\n" +
                error.message
            );


            submitBtn.disabled =
                false;


            submitBtn.innerText =
                "Submit Availability";

        }

    }
);


// ==========================================
// SUCCESS MESSAGE
// ==========================================

function showSuccessMessage() {

    const modal =
        document.getElementById(
            "successModal"
        );


    modal.style.display =
        "flex";

}


// ==========================================
// COUNTDOWN
// ==========================================

function startCountdown() {

    let seconds = 10;


    submitBtn.disabled =
        true;


    const timer =
        setInterval(
            function () {

                submitBtn.innerText =
                    `Submitted ✓ (${seconds}s)`;


                seconds--;


                if (
                    seconds < 0
                ) {

                    clearInterval(
                        timer
                    );


                    submitBtn.disabled =
                        false;


                    submitBtn.innerText =
                        "Submit Availability";


                    submitBtn.style.background =
                        "";


                }

            },
            1000
        );

}


// ==========================================
// RESET FORM
// ==========================================

function resetForm() {

    document.getElementById(
        "name"
    ).value = "";


    document.getElementById(
        "studentId"
    ).value = "";


    document.getElementById(
        "department"
    ).value = "";


    document.getElementById(
        "phone"
    ).value = "";


    document.getElementById(
        "note"
    ).value = "";


    document
        .querySelectorAll(
            ".slot.selected"
        )
        .forEach(slot => {

            slot.classList.remove(
                "selected"
            );

        });


    calculateFreeTime();

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

    document.getElementById(
        "successModal"
    ).style.display =
        "none";

}