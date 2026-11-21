import { db, auth } from "../firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Your authorized admin UID
const ADMIN_UID = "V08RO4VYBbhm0CLnOcNUJtaAe7j1";

// Page elements
const loginSection = document.getElementById("loginSection");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const newsForm = document.getElementById("newsForm");
const loginMessage = document.getElementById("loginMessage");
const adminNewsList = document.getElementById("adminNewsList");
const publishButton = document.getElementById("publishButton");
const cancelEditButton = document.getElementById("cancelEdit");
const logoutButton = document.getElementById("logoutButton");

function isAdmin() {
    return auth.currentUser && auth.currentUser.uid === ADMIN_UID;
}

// LOGIN
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginMessage.textContent = "";
    } catch (error) {
        console.error(error);
        loginMessage.textContent = "Login failed. Check your details.";
    }
});

// SHOW LOGIN OR DASHBOARD
onAuthStateChanged(auth, async (user) => {
    if (user && user.uid === ADMIN_UID) {
        loginSection.classList.add("hidden");
        dashboard.classList.remove("hidden");
        await loadAdminNews();
    } else {
        dashboard.classList.add("hidden");
        loginSection.classList.remove("hidden");

        if (user) {
            loginMessage.textContent = "This account is not authorized.";
            await signOut(auth);
        }
    }
});

// PUBLISH OR UPDATE NEWS
newsForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin()) {
        alert("You are not authorized.");
        return;
    }

    const editId = document.getElementById("editId").value;

    publishButton.disabled = true;
    publishButton.textContent = "Please wait...";

    try {
        const imageUrl = document.getElementById("imageUrl").value.trim();

        // Check the image link only if one was entered
        if (imageUrl) {
            const parsedUrl = new URL(imageUrl);
            if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
                throw new Error("Please enter a valid image URL.");
            }
        }

        const newsData = {
            title: document.getElementById("title").value.trim(),
            category: document.getElementById("category").value,
            summary: document.getElementById("summary").value.trim(),
            content: document.getElementById("content").value.trim(),
            imageUrl
        };

        if (editId) {
            await updateDoc(doc(db, "news", editId), newsData);
            alert("News updated successfully!");
        } else {
            await addDoc(collection(db, "news"), {
                ...newsData,
                publishedAt: serverTimestamp()
            });
            alert("News published successfully!");
        }

        resetForm();
        await loadAdminNews();

    } catch (error) {
        console.error(error);
        alert("Could not save news: " + error.message);
    } finally {
        publishButton.disabled = false;
        publishButton.textContent = document.getElementById("editId").value
            ? "Update News"
            : "Publish News";
    }
});

// LOAD NEWS LIST
async function loadAdminNews() {
    adminNewsList.textContent = "Loading...";

    try {
        const newsQuery = query(
            collection(db, "news"),
            orderBy("publishedAt", "desc")
        );

        const snapshot = await getDocs(newsQuery);

        if (snapshot.empty) {
            adminNewsList.textContent = "No published news yet.";
            return;
        }

        adminNewsList.innerHTML = "";

        snapshot.forEach((documentSnapshot) => {
            const news = documentSnapshot.data();
            const id = documentSnapshot.id;

            const item = document.createElement("div");
            item.className = "admin-news-item";

            const title = document.createElement("h3");
            title.textContent = news.title || "Untitled";

            const category = document.createElement("p");
            category.textContent = news.category || "";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editNews(id, news));

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.className = "delete-btn";
            deleteButton.addEventListener("click", () => deleteNews(id));

            item.append(title, category, editButton, deleteButton);
            adminNewsList.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        adminNewsList.textContent = "Could not load your news.";
    }
}

// START EDITING
function editNews(id, news) {
    if (!isAdmin()) return;

    document.getElementById("editId").value = id;
    document.getElementById("title").value = news.title || "";
    document.getElementById("category").value = news.category || "";
    document.getElementById("summary").value = news.summary || "";
    document.getElementById("content").value = news.content || "";
    document.getElementById("imageUrl").value = news.imageUrl || "";

    publishButton.textContent = "Update News";
    cancelEditButton.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// CLEAR FORM AND LEAVE EDIT MODE
function resetForm() {
    newsForm.reset();
    document.getElementById("editId").value = "";
    publishButton.textContent = "Publish News";
    cancelEditButton.classList.add("hidden");
}

cancelEditButton.addEventListener("click", resetForm);

// DELETE NEWS
async function deleteNews(id) {
    if (!isAdmin()) {
        alert("You are not authorized.");
        return;
    }

    if (!confirm("Are you sure you want to delete this news?")) return;

    try {
        await deleteDoc(doc(db, "news", id));
        alert("News deleted successfully!");
        await loadAdminNews();
    } catch (error) {
        console.error(error);
        alert("Could not delete news: " + error.message);
    }
}

// LOGOUT
logoutButton.addEventListener("click", async () => {
    await signOut(auth);
});
