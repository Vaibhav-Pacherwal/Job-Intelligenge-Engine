import { chromium } from 'playwright';
import Job from '../models/job.model.js';
import Company from '../models/company.model.js';
import connectDB from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

let browser;
const microsoftScraper = async () => {
    try {
        await connectDB();
        browser = await chromium.launch({ headless: false });
        const page = await browser.newPage();

        const company = await Company.findOne({ name: "Microsoft" });
        
        let start = 0;
        while(true) {
            const response_1 = await page.request.get(
                `https://apply.careers.microsoft.com/api/pcsx/search?domain=microsoft.com&query=&location=&start=${start}&sort_by=timestamp&`
            );
            if (!response_1.ok()) {
                console.log(`Search API failed: ${response_1.status()}`);
                console.log(await response_1.text());

                if (response_1.status() === 429) {
                    console.log("Rate limited. Waiting 60 seconds...");
                    await page.waitForTimeout(60000);
                    continue;
                }

                break;
            }
            const jsonResponse_1 = await response_1.json();
            const positions = jsonResponse_1.data.positions;
            if(positions.length === 0) {
                console.log("No more positions found. Exiting loop.");
                break;
            }

            const jobs = [];
            for(const position of positions) {
                const response_2 = await page.request.get(`https://apply.careers.microsoft.com/api/pcsx/position_details?position_id=${position.id}&domain=microsoft.com&hl=en`);
                const jsonResponse_2 = await response_2.json();
                const positionDetails = jsonResponse_2.data;
                jobs.push({
                    company: company._id,
                    externalJobId: positionDetails.displayJobId,
                    role: positionDetails.name,
                    department: positionDetails.department,
                    location: positionDetails.location,
                    description: positionDetails.jobDescription,
                    jobUrl: positionDetails.publicUrl,
                    listedOn: new Date(positionDetails.postedTs*1000),
                });
            }
            await Job.insertMany(jobs, { ordered: false })
            .then(() => {
                console.log(`Scraped positions from Microsoft starting at index ${start}`);
            }).catch((error) => {
                console.error("Error occurred while saving job:", error);
            });

            start += 10;
        }
    } catch (error) {
        console.error("Error occurred while launching browser:", error);
    } finally {
        if(browser) {
            await browser.close();
        }
        console.log("Browser closed");
    }
}

export default microsoftScraper;