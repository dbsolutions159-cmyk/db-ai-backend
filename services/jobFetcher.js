const axios = require("axios");
const Job = require("../models/job");

// 🔹 Duplicate key generator
function createKey(title, company, location){
  return `${title}-${company}-${location}`.toLowerCase();
}

// 🔹 Basic skill extractor
function extractSkills(text){
  const skillsList = [
    "react","node","javascript","python","java","html","css","mongodb"
  ];

  return skillsList.filter(skill =>
    text.toLowerCase().includes(skill)
  );
}

// ================= MAIN FUNCTION =================
const fetchJobs = async () => {
  try {

    console.log("🔥 Fetching jobs from Adzuna...");

    const res = await axios.get(
      "https://api.adzuna.com/v1/api/jobs/in/search/1",
      {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          results_per_page: 20,
          what: "developer",
          where: "india"
        }
      }
    );

    const jobs = res.data.results || [];

    let count = 0;

    for (let j of jobs) {

      const key = createKey(
        j.title,
        j.company.display_name,
        j.location.display_name
      );

      // 🔥 duplicate check
      const exists = await Job.findOne({ source: key });
      if (exists) continue;

      await Job.create({
        title: j.title,
        company: j.company.display_name,
        location: j.location.display_name,
        description: j.description,
        url: j.redirect_url,
        salary: j.salary_min
          ? `${j.salary_min} - ${j.salary_max}`
          : "Not disclosed",
        skills: extractSkills(j.description),
        source: key
      });

      count++;
    }

    console.log(`✅ New jobs saved: ${count}`);

  } catch (err) {
    console.log("❌ Job Fetch Error:", err.message);
  }
};

module.exports = fetchJobs;
