package yugi.servlet.admin.task;

import java.io.IOException;
import java.util.List;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import yugi.PMF;
import yugi.model.auto.AutoUploadCard;

public class DeleteAutoUploadCardsTaskServlet extends HttpServlet {

	private static final long serialVersionUID = 1349783344649586517L;

	private static final Logger logger = Logger.getLogger(
			DeleteAutoUploadCardsTaskServlet.class.getName());

	/**
	 * This task will delete all auto upload card entries.
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {

		logger.info("Deleting all auto upload entries.");
		int deleted = 0;
		PersistenceManager pm = PMF.get().getPersistenceManager();
		Query query = pm.newQuery(AutoUploadCard.class);
		try {
			@SuppressWarnings("unchecked")
			List<AutoUploadCard> autoUploadCards = (List<AutoUploadCard>) query.execute();
			pm.deletePersistentAll(autoUploadCards);
			deleted = autoUploadCards.size();
		} finally {
			query.closeAll();
			pm.close();
		}
		logger.info("Deleted " + deleted + " auto upload card entries.");
	}
}
