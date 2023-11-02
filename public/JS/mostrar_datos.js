document.addEventListener("DOMContentLoaded", function () {
    const summaries = document.querySelectorAll("summary");
  
    summaries.forEach((summary) => {
      summary.addEventListener("click", function () {
        const icon = summary.querySelector(".info-icon");
        icon.classList.toggle("clicked");
      });
    });
  });
  