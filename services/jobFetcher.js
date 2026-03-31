// 🔥 SAFE VERSION (no external API)
const Job = require("../models/job");

const fetchJobs = async () => {
  try {
    console.log("Fetching jobs (dummy)...");

    // Dummy job insert (test purpose)
    const sampleJobs = [
      {
        title: "Customer Support Executive",
        company: "Demo Company",
        location: "Bhopal",
        salary: "20k-25k"
      },
      {
        title: "Sales Executive",
        company: "Demo Company",
        location: "Indore",
        salary: "18k-22k"
      }
    ];

    for (let job of sampleJobs) {
      await Job.create(job);
    }

    console.log("Jobs inserted ✅");

  } catch (err) {
    console.log("Job Fetch Error:", err);
  }
};

module.exports = fetchJobs;
