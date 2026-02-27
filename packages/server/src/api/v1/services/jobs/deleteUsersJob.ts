import path from "path";
import { DeletedUsersDao } from "../../db/dao/deletedUsersDao.js";
import { GraphDao } from "../../db/dao/graphDao.js";
import { UserDao } from "../../db/dao/UserDao.js";
import { publicDirname } from "../../constants.js";
import {
  createPathFromUrl,
  deleteFiles,
} from "../../middleware/fileStorage.js";

export async function deleteUsersJob() {
  const deletedUserDao = new DeletedUsersDao();

  const userIds = (await deletedUserDao.getScheduledDeletions()).map(
    (obj) => obj.user_id,
  );
  if (!userIds.length) return;

  const savedImages = await new GraphDao().getSavedImages(userIds);
  if (!(await new UserDao().deleteUsers(userIds))) return;

  if (!savedImages) return true;

  const dir = path.join(publicDirname, "/images");
  const paths = createPathFromUrl(
    savedImages.map((obj) => obj.image),
    dir,
  );

  const deleted = await deleteFiles(paths);
  for (let i = 0; i < paths.length; i++) {
    if (!deleted) {
      console.log("Failed to delete file: ", paths[i]);
    }
  }
}
