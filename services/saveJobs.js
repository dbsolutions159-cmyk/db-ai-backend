



const Job = require("../models/job");

async function saveJobs(data) {
  try {
    if (!data || !data.data) return;

    for (let job of data.data) {

      const exists = await Job.findOne({
        title: job.job_title,
        company: job.employer_name
      });

      if (!exists) {
        await Job.create({
          title: job.job_title || "Unknown",
          company: job.employer_name || "Unknown",
          location:
            job.job_city ||
            job.job_state ||
            job.job_country ||
            "India",
          salary:
            job.job_salary ||
            job.job_min_salary ||
            job.job_max_salary ||
            "Not disclosed",
          skills: job.job_required_skills
            ? job.job_required_skills.join(", ")
            : "Not specified",
          link: job.job_apply_link || "",
          source: "API"
        });
      }
    }

    console.log("✅ Jobs updated from API");

  } catch (err) {
    console.log("❌ Save error:", err.message);
  }
}

module.exports = saveJobs;