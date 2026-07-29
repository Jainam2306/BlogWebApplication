import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const inputPassword = ""
const verifiedPassword = "login123"

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory data store: resets to these seed posts whenever the server restarts.
// id 0 is reserved for the featured post and is filtered out of the main feed grid in workspace.ejs.
let nextPostId = 4;
const posts = [
    {
        id: 0,
        tag: "Life & Thoughts",
        title: "The Quiet Power of Starting Small",
        excerpt: "Every story worth telling begins with a single sentence you weren't sure about. Here's why the smallest ideas often turn into the most meaningful ones — and why you shouldn't wait for the \"perfect\" moment to start writing.",
        author: "Ananya Rao",
        date: "Jul 24, 2026",
        draft: false,
        featured: true,
    },
    {
        id: 1,
        tag: "Travel",
        title: "Chasing Sunsets Across the Coast",
        excerpt: "A three-day trip that turned into the reset I didn't know I needed.",
        author: "Jainam Shah",
        date: "Jul 21, 2026",
        draft: false,
    },
    {
        id: 2,
        tag: "Tutorial",
        title: "Five Habits That Made Me a Better Writer",
        excerpt: "None of these are groundbreaking. All of them work if you stick with them.",
        author: "Jainam Shah",
        date: "Jul 18, 2026",
        draft: false,
    },
    {
        id: 3,
        tag: "Draft",
        title: "Untitled — Thoughts on Slowing Down",
        excerpt: "Not ready to publish yet, but the idea is finally taking shape.",
        author: "Jainam Shah",
        date: "Last edited Jul 27, 2026",
        draft: true,
    },
];


app.listen(port,() => {
    console.log(`Server running on port ${port}`);
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

// "Create Your First Post" on the homepage links here; renders the login/register
// form (not views/forms.ejs, which is an older unused view) since you must register first.
app.get("/forms", (req, res) => {
    res.render("login.ejs", { error: null });
});

app.get("/about", (req, res) => {
    res.render("aboutus.ejs");
});

app.get("/register", (req, res) => {
    res.render("login.ejs", { error: null });
});

// Shared render call for the workspace page so both the login flow and the
// GET /workspace redirect target below stay in sync with the same data.
function renderWorkspace(res, { fName, lastName, email }) {
    res.render("workspace.ejs", { fName, lastName, email, posts });
}

app.post("/submit", (req, res) => {
    if (req.body.loginPassword === verifiedPassword) {
        renderWorkspace(res, { fName: req.body.firstName, lastName: req.body.lastName, email: req.body.email });
    } else {
        res.render("login.ejs", { error: "Incorrect password. Please try again." });
    }

});

// There's no session/auth middleware here, so the logged-in user's name/email
// aren't stored server-side. Instead they're passed around as query params
// (see the ?fName=...&lastName=...&email=... links in workspace.ejs and
// edit-post.ejs) and this route re-renders the workspace from those params
// whenever publishing, editing, or cancelling redirects back here.
app.get("/workspace", (req, res) => {
    renderWorkspace(res, { fName: req.query.fName, lastName: req.query.lastName, email: req.query.email });
});

// Handles the "Share your thoughts" composer form on the workspace page.
app.post("/posts", (req, res) => {
    const author = `${req.body.fName || ""} ${req.body.lastName || ""}`.trim() || "You";

    // unshift (not push) so the new post shows up first in "Your Feed".
    posts.unshift({
        id: nextPostId++,
        tag: "General",
        title: req.body.postTitle,
        excerpt: req.body.postBody,
        author,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        draft: false,
    });

    // Redirect (not render) so a page refresh after publishing doesn't resubmit the form.
    res.redirect(
        `/workspace?fName=${encodeURIComponent(req.body.fName || "")}&lastName=${encodeURIComponent(req.body.lastName || "")}&email=${encodeURIComponent(req.body.email || "")}`
    );
});

// Called via fetch() from public/script.js (the delete button has no page to
// reload), so this responds with JSON rather than rendering/redirecting.
app.delete("/posts/:id", (req, res) => {
    const postId = Number(req.params.id);
    const postIndex = posts.findIndex((post) => post.id === postId);

    if (postIndex === -1) {
        return res.status(404).json({ error: "Post not found" });
    }

    posts.splice(postIndex, 1);
    res.status(200).json({ success: true });
});

// Renders the edit form pre-filled with the post's current data. Used both by
// the feed grid's edit icons and the featured post's edit icon (post id 0).
app.get("/posts/:id/edit", (req, res) => {
    const postId = Number(req.params.id);
    const post = posts.find((post) => post.id === postId);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    res.render("edit-post.ejs", { post, fName: req.query.fName, lastName: req.query.lastName, email: req.query.email });
});

// Saves the edited title/excerpt in place (mutates the shared posts array) and
// redirects back to the workspace, carrying the user's identity forward via query params.
app.post("/posts/:id/edit", (req, res) => {
    const postId = Number(req.params.id);
    const post = posts.find((post) => post.id === postId);

    if (!post) {
        return res.status(404).send("Post not found");
    }

    post.title = req.body.title;
    post.excerpt = req.body.excerpt;

    res.redirect(
        `/workspace?fName=${encodeURIComponent(req.body.fName || "")}&lastName=${encodeURIComponent(req.body.lastName || "")}&email=${encodeURIComponent(req.body.email || "")}`
    );
});
    
