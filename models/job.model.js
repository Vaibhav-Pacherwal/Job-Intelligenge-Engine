import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },

    externalJobId: {
        type: String,
        required: true,
        unique: true
    },

    role: {
        type: String,
        required: true,
        trim: true
    },

    department: {
        type: String,
        trim: true
    },

    location: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    jobUrl: {
        type: String,
        required: true,
        trim: true
    },

    listedOn: Date,

    firstSeen: {
        type: Date,
        default: Date.now
    },

    isActive: {
        type: Boolean,
        default: true
    },

    ai: {
        summary: String,
        experience: String,
        education: [String],
        requiredSkills: [String],
        preferredSkills: [String],
        responsibilities: [String]
    },

    status: {
        scraped: {
            type: Boolean,
            default: true
        },
        summarized: {
            type: Boolean,
            default: false
        },
        tweeted: {
            type: Boolean,
            default: false
        }
    },

    aiEligible: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

jobSchema.index(
    {
        company: 1,
        externalJobId: 1
    },
    {
        unique: true
    }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;