import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import uploadLocal from "../lib/uploadLocal.js";

class AdminController {
  static async createSong(req, res, next) {
    try {
      const { title, artist, albumId, duration } = req.body;
      const audioFile = req.files?.audioFile;
      const imageFile = req.files?.imageFile;

      if (!audioFile || !imageFile) {
        return res.status(400).json({ message: "Please upload all files" });
      }

      const audioPath = await uploadLocal.saveFileLocally(audioFile);
      const imagePath = await uploadLocal.saveFileLocally(imageFile);

      const song = new Song({
        title,
        artist,
        audioUrl: audioPath,
        imageUrl: imagePath,
        duration,
        albumId: albumId || null,
      });

      await song.save();

      if (albumId) {
        await Album.findByIdAndUpdate(albumId, { $push: { songs: song._id } });
      }

      res.status(201).json(song);
    } catch (error) {
      console.error("Error in createSong", error);
      next(error);
    }
  }

  static async createAlbum(req, res, next) {
    try {
      const { title, artist, releaseYear } = req.body;
      const imageFile = req.files?.imageFile;

      if (!imageFile) {
        return res
          .status(400)
          .json({ message: "Please upload the image file" });
      }

      const imageUrl = await uploadLocal.saveFileLocally(imageFile);

      const album = new Album({
        title,
        artist,
        imageUrl,
        releaseYear,
      });

      await album.save();

      res.status(201).json(album);
    } catch (error) {
      console.error("Error in createAlbum", error);
      next(error);
    }
  }

  static async deleteSong(req, res, next) {
    try {
      const { id } = req.params;
      const song = await Song.findById(id);

      if (song?.albumId) {
        await Album.findByIdAndUpdate(song.albumId, {
          $pull: { songs: song._id },
        });
      }

      await Song.findByIdAndDelete(id);
      res.status(200).json({ message: "Song deleted successfully" });
    } catch (error) {
      console.error("Error in deleteSong", error);
      next(error);
    }
  }

  static async deleteAlbum(req, res, next) {
    try {
      const { id } = req.params;
      await Song.deleteMany({ albumId: id });
      await Album.findByIdAndDelete(id);
      res.status(200).json({ message: "Album deleted successfully" });
    } catch (error) {
      console.error("Error in deleteAlbum", error);
      next(error);
    }
  }

  static async checkAdmin(req, res, next) {
    res.status(200).json({ admin: true });
  }
}

export default AdminController;
