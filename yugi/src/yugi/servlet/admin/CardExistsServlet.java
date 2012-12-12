package yugi.servlet.admin;

import java.io.IOException;
import java.util.List;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONObject;

import yugi.Config;
import yugi.PMF;
import yugi.model.Card;

public class CardExistsServlet extends HttpServlet {

	private static final long serialVersionUID = 3021060432233658648L;
	private static final Logger logger = Logger.getLogger(CardExistsServlet.class.getName());
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		// Get the card name parameter.
		String name = Config.getCardName(req);
		logger.info("Checking to see if \"" + name + "\" exists.");

		// Put the name back in the response so the client can match it up.
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("name", name);
		jsonObject.put("card", null);

		PersistenceManager pm = PMF.get().getPersistenceManager();
		try {
			Query query = pm.newQuery(Card.class);
			query.setFilter("upperName == nameParam");
			query.declareParameters("String nameParam");

			@SuppressWarnings("unchecked")
			List<Card> cards = (List<Card>) query.execute(name.toUpperCase());
			if (!cards.isEmpty()) {
				jsonObject.put("card", cards.get(0).toJson());
			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			pm.close();
		}

		resp.setContentType("text/json");
		resp.getWriter().write(jsonObject.toString());
	}
}
