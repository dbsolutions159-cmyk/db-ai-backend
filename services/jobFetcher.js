const axios = require("axios");
const Job = require("../models/job");

const fetchJobs = async () => {
  try {

    console.log("🔥 Fetching jobs from Adzuna...");

    const APP_ID = process.env.ADZUNA_APP_ID;
    const APP_KEY = process.env.ADZUNA_APP_KEY;

    // 🔥 DEBUG
    console.log("APP_ID:", APP_ID);
    console.log("APP_KEY:", APP_KEY ? "Loaded ✅" : "Missing ❌");

    const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=20&what=developer&where=india`;

    const res = await axios.get(url);

    const jobs = res.data.results || [];

    console.log("Jobs fetched:", jobs.length);

    await Job.deleteMany({}); // साफ DB

    for (let j of jobs) {
      await Job.create({
        title: j.title,
        company: j.company.display_name,
        location: j.location.display_name,
        description: j.description,
        url: j.redirect_url,
        salary: j.salary_min
          ? `${j.salary_min} - ${j.salary_max}`
          : "Not disclosed",
        source: "adzuna"
      });
    }

    console.log("✅ Jobs saved:", jobs.length);

  } catch (err) {
    console.log("❌ FULL ERROR:", err.response?.data || err.message);
  }
};

module.exports = fetchJobs;
