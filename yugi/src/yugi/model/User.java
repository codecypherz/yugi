package yugi.model;

import org.json.JSONObject;

public class User {

	private String name;
	private String email;
	private boolean signedIn;
	private boolean admin;
	
	public User() {
		this(null);
	}
	
	public User(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	
	public boolean isSignedIn() {
		return signedIn;
	}
	public void setSignedIn(boolean signedIn) {
		this.signedIn = signedIn;
	}
	
	public boolean isAdmin() {
		return admin;
	}
	public void setAdmin(boolean admin) {
		this.admin = admin;
	}
	
	public JSONObject toJson() {
		JSONObject json = new JSONObject();
		json.put("name", name);
		json.put("email", email);
		json.put("signed-in", signedIn);
		json.put("admin", admin);
		return json;
	}
}
