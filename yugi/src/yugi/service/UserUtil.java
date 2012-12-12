package yugi.service;

import yugi.model.User;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

public class UserUtil {

	private static UserService userService = UserServiceFactory.getUserService();
	
	/**
	 * Gets the current user information as a JSON string.
	 * @return The serialized user information.
	 */
	public static String getCurrentUserAsJson() {
		User user = new User();
		
		com.google.appengine.api.users.User currentUser = userService.getCurrentUser();
		if (currentUser != null) {
			user.setName(currentUser.getNickname());
			user.setEmail(currentUser.getEmail());
			user.setSignedIn(true);
			user.setAdmin(userService.isUserAdmin());
		}
		
		return user.toJson().toString();
	}
}
