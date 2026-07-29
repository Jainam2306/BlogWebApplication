// Wires up the trash-can icon on each post card. Deleting has no page to reload,
// so it calls the DELETE /posts/:id API directly and removes the card from the DOM
// on success instead of re-rendering the whole workspace page.
document.querySelectorAll(".post-delete-btn").forEach((button) => {
    button.addEventListener("click", async () => {
        const postId = button.dataset.postId;
        const postCard = button.closest(".post-card");

        if (!confirm("Delete this post? This can't be undone.")) {
            return;
        }

        try {
            const response = await fetch(`/posts/${postId}`, { method: "DELETE" });

            if (!response.ok) {
                throw new Error("Failed to delete post");
            }

            postCard.remove();
        } catch (err) {
            alert("Something went wrong while deleting the post.");
            console.error(err);
        }
    });
});
