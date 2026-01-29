const GoogleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    const checked = await client.verifyIdToken({
      idToken: token,
      audience: "786543282178-rlt210nnkolu2r6fiiajtudt2j54je1v.apps.googleusercontent.com",
    });

    const payload = checked.getPayload();
    const user_id = payload.sub;
    const email = payload.email;

    // 1. Check if user already exists
    const existing = await database_conn.query(
      "SELECT user_id, email FROM accounts WHERE email = $1",
      [email]
    );

    // 2. If exists → just login
    if (existing.rows.length > 0) {
      return res.status(200).json(existing.rows[0]);
    }

    // 3. Else → create new user
    const hashedpassword = await bcrypt.hash("google_user", 10);

    const result = await database_conn.query(
      "INSERT INTO accounts(user_id, email, password) VALUES($1, $2, $3) RETURNING user_id, email",
      [user_id, email, hashedpassword]
    );

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error("GoogleAuth error:", err);
    res.status(500).json({ message: "Google auth failed" });
  }
};