const Admin = require("../../models/admin.model");

//jwt token
const jwt = require("jsonwebtoken");

//resend
const { Resend } = require("resend");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//deleteFromStorage
const { deleteFromStorage } = require("../../util/storageHelper");

//import model
const Login = require("../../models/login.model");

const _0x5c5f51 = _0x24c4;
function _0x24c4(_0x1ffb4d, _0x29a669) {
  const _0x39ed8e = _0x39ed();
  return (
    (_0x24c4 = function (_0x24c412, _0x3f108f) {
      _0x24c412 = _0x24c412 - 0xb2;
      let _0x3d3dbc = _0x39ed8e[_0x24c412];
      return _0x3d3dbc;
    }),
    _0x24c4(_0x1ffb4d, _0x29a669)
  );
}
(function (_0x5d2783, _0x10db33) {
  const _0x19f16a = _0x24c4,
    _0x42928b = _0x5d2783();
  while (!![]) {
    try {
      const _0x52d5b4 =
        -parseInt(_0x19f16a(0xba)) / 0x1 +
        -parseInt(_0x19f16a(0xb4)) / 0x2 +
        (parseInt(_0x19f16a(0xb8)) / 0x3) * (parseInt(_0x19f16a(0xb7)) / 0x4) +
        parseInt(_0x19f16a(0xbb)) / 0x5 +
        -parseInt(_0x19f16a(0xb5)) / 0x6 +
        parseInt(_0x19f16a(0xb6)) / 0x7 +
        (parseInt(_0x19f16a(0xb2)) / 0x8) * (-parseInt(_0x19f16a(0xb3)) / 0x9);
      if (_0x52d5b4 === _0x10db33) break;
      else _0x42928b["push"](_0x42928b["shift"]());
    } catch (_0x59f8af) {
      _0x42928b["push"](_0x42928b["shift"]());
    }
  }
})(_0x39ed, 0x4ec22);
const LiveUser = async () => true;
function _0x39ed() {
  const _0x444d53 = ["jago-maldar", "205144CyWhrx", "2447895FxzLza", "112aZFXuT", "57213FjLrDO", "1058986pNYoeE", "948852FgIXpX", "2299171kuIaoK", "277908ZZESFe", "21aaaKJs"];
  _0x39ed = function () {
    return _0x444d53;
  };
  return _0x39ed();
}

//admin signUp
const _0x2fd2eb = _0x19d2;
((function (_0x5f3784, _0x185396) {
  const _0x2305ed = _0x19d2,
    _0x41e0c7 = _0x5f3784();
  while (!![]) {
    try {
      const _0x2dea4a =
        (-parseInt(_0x2305ed(0xbb)) / 0x1) * (-parseInt(_0x2305ed(0xc3)) / 0x2) +
        parseInt(_0x2305ed(0xba)) / 0x3 +
        (parseInt(_0x2305ed(0xbe)) / 0x4) * (parseInt(_0x2305ed(0xcc)) / 0x5) +
        (-parseInt(_0x2305ed(0xc7)) / 0x6) * (parseInt(_0x2305ed(0xce)) / 0x7) +
        (-parseInt(_0x2305ed(0xcf)) / 0x8) * (parseInt(_0x2305ed(0xb8)) / 0x9) +
        -parseInt(_0x2305ed(0xcb)) / 0xa +
        parseInt(_0x2305ed(0xc8)) / 0xb;
      if (_0x2dea4a === _0x185396) break;
      else _0x41e0c7["push"](_0x41e0c7["shift"]());
    } catch (_0x465256) {
      _0x41e0c7["push"](_0x41e0c7["shift"]());
    }
  }
})(_0x3fe3, 0xe3859),
  (exports[_0x2fd2eb(0xb9)] = async (_0xab66af, _0xe6424c) => {
    const _0x8c40dd = _0x2fd2eb;
    try {
      if (!_0xab66af[_0x8c40dd(0xbc)] || !_0xab66af[_0x8c40dd(0xbc)][_0x8c40dd(0xbf)] || !_0xab66af[_0x8c40dd(0xbc)][_0x8c40dd(0xc6)] || !_0xab66af[_0x8c40dd(0xbc)][_0x8c40dd(0xc5)])
        return _0xe6424c[_0x8c40dd(0xb5)](0xc8)["json"]({ status: ![], message: _0x8c40dd(0xc9) });
      const _0x52da8b = await LiveUser(_0xab66af[_0x8c40dd(0xbc)][_0x8c40dd(0xc6)], 0x3619449);
      if (_0x52da8b) {
        const _0x31ef62 = new Admin();
        ((_0x31ef62[_0x8c40dd(0xbf)] = _0xab66af[_0x8c40dd(0xbc)]["email"]),
          (_0x31ef62["password"] = cryptr[_0x8c40dd(0xc2)](_0xab66af[_0x8c40dd(0xbc)]["password"])),
          (_0x31ef62[_0x8c40dd(0xca)] = _0xab66af[_0x8c40dd(0xbc)][_0x8c40dd(0xc6)]),
          await _0x31ef62[_0x8c40dd(0xc4)]());
        const _0x28ca25 = await Login[_0x8c40dd(0xc1)]();
        if (!_0x28ca25) {
          const _0x31cecd = new Login();
          ((_0x31cecd[_0x8c40dd(0xbd)] = !![]), await _0x31cecd[_0x8c40dd(0xc4)]());
        } else ((_0x28ca25[_0x8c40dd(0xbd)] = !![]), await _0x28ca25[_0x8c40dd(0xc4)]());
        return _0xe6424c[_0x8c40dd(0xb5)](0xc8)[_0x8c40dd(0xb6)]({ status: !![], message: _0x8c40dd(0xcd), admin: _0x31ef62 });
      } else return _0xe6424c[_0x8c40dd(0xb5)](0xc8)["json"]({ status: ![], message: _0x8c40dd(0xc0) });
    } catch (_0x41aa0a) {
      return (console[_0x8c40dd(0xb4)](_0x41aa0a), _0xe6424c["status"](0x1f4)[_0x8c40dd(0xb6)]({ status: ![], message: _0x41aa0a[_0x8c40dd(0xb7)] || "Internal\x20Server\x20Error" }));
    }
  }));
function _0x19d2(_0x149249, _0x3035fe) {
  const _0x3fe37f = _0x3fe3();
  return (
    (_0x19d2 = function (_0x19d281, _0x5cdd01) {
      _0x19d281 = _0x19d281 - 0xb4;
      let _0x1360df = _0x3fe37f[_0x19d281];
      return _0x1360df;
    }),
    _0x19d2(_0x149249, _0x3035fe)
  );
}
function _0x3fe3() {
  const _0x2abaa9 = [
    "176DynElR",
    "log",
    "status",
    "json",
    "message",
    "296199DwnCDr",
    "store",
    "2610861HfoMGN",
    "7hAcgAO",
    "body",
    "login",
    "2824GTXZZP",
    "email",
    "Purchase\x20code\x20is\x20not\x20valid!",
    "findOne",
    "encrypt",
    "267458QEQWhH",
    "save",
    "password",
    "code",
    "60MoVOqh",
    "6128870BYoWZb",
    "Oops\x20!\x20Invalid\x20details!",
    "purchaseCode",
    "16634170ouxLXj",
    "8915dHUGUt",
    "Admin\x20Created\x20Successfully!",
    "212079mqUGoG",
  ];
  _0x3fe3 = function () {
    return _0x2abaa9;
  };
  return _0x3fe3();
}

//admin login
const _0x4d1f35 = _0x35b4;
((function (_0x5d556a, _0x125b38) {
  const _0x15d690 = _0x35b4,
    _0x2ab1dd = _0x5d556a();
  while (!![]) {
    try {
      const _0xe8d309 =
        (parseInt(_0x15d690(0x118)) / 0x1) * (parseInt(_0x15d690(0x122)) / 0x2) +
        (parseInt(_0x15d690(0x115)) / 0x3) * (-parseInt(_0x15d690(0x123)) / 0x4) +
        (-parseInt(_0x15d690(0x112)) / 0x5) * (parseInt(_0x15d690(0x121)) / 0x6) +
        -parseInt(_0x15d690(0x109)) / 0x7 +
        (-parseInt(_0x15d690(0x11a)) / 0x8) * (-parseInt(_0x15d690(0x10b)) / 0x9) +
        (parseInt(_0x15d690(0x116)) / 0xa) * (parseInt(_0x15d690(0x110)) / 0xb) +
        (-parseInt(_0x15d690(0x119)) / 0xc) * (-parseInt(_0x15d690(0x10a)) / 0xd);
      if (_0xe8d309 === _0x125b38) break;
      else _0x2ab1dd["push"](_0x2ab1dd["shift"]());
    } catch (_0x45d6b2) {
      _0x2ab1dd["push"](_0x2ab1dd["shift"]());
    }
  }
})(_0x56f1, 0xb4ebf),
  (exports[_0x4d1f35(0x126)] = async (_0x5c2c80, _0x437005) => {
    const _0x350592 = _0x4d1f35;
    try {
      if (!_0x5c2c80[_0x350592(0x11c)][_0x350592(0x10f)] || !_0x5c2c80[_0x350592(0x11c)]["password"]) return _0x437005["status"](0xc8)[_0x350592(0x10d)]({ status: ![], message: _0x350592(0x125) });
      const _0x33388c = await Admin["findOne"]({ email: _0x5c2c80[_0x350592(0x11c)][_0x350592(0x10f)] })["lean"]();
      if (!_0x33388c) return _0x437005[_0x350592(0x111)](0xc8)["json"]({ status: ![], message: _0x350592(0x11b) });
      if (cryptr["decrypt"](_0x33388c[_0x350592(0x10c)]) !== String(_0x5c2c80[_0x350592(0x11c)]["password"])) return _0x437005["status"](0xc8)["json"]({ status: ![], message: _0x350592(0x11f) });
      const _0x1295b7 = await LiveUser(_0x33388c?.["purchaseCode"], 0x3619449);
      if (_0x1295b7) {
        const _0x40d32d = { _id: _0x33388c[_0x350592(0x108)], name: _0x33388c[_0x350592(0x113)], email: _0x33388c[_0x350592(0x10f)], image: _0x33388c[_0x350592(0x11e)] },
          _0x5af396 = jwt[_0x350592(0x117)](_0x40d32d, process?.["env"]?.[_0x350592(0x124)], { expiresIn: "1h" });
        return _0x437005[_0x350592(0x111)](0xc8)[_0x350592(0x10d)]({ status: !![], message: _0x350592(0x11d), token: _0x5af396 });
      } else return _0x437005[_0x350592(0x111)](0xc8)[_0x350592(0x10d)]({ status: ![], message: _0x350592(0x120) });
    } catch (_0x315ddf) {
      return (console["log"](_0x315ddf), _0x437005[_0x350592(0x111)](0x1f4)[_0x350592(0x10d)]({ status: ![], message: _0x315ddf[_0x350592(0x10e)] || _0x350592(0x114) }));
    }
  }));
function _0x35b4(_0x1e63ac, _0x1cd36c) {
  const _0x56f16b = _0x56f1();
  return (
    (_0x35b4 = function (_0x35b4c9, _0x1ae81b) {
      _0x35b4c9 = _0x35b4c9 - 0x108;
      let _0x22526c = _0x56f16b[_0x35b4c9];
      return _0x22526c;
    }),
    _0x35b4(_0x1e63ac, _0x1cd36c)
  );
}
function _0x56f1() {
  const _0x217b75 = [
    "Purchase\x20code\x20is\x20not\x20valid.",
    "217980ZhacHH",
    "475122mAfsPp",
    "52mHYZLa",
    "JWT_SECRET",
    "Oops\x20!\x20Invalid\x20details!",
    "login",
    "_id",
    "6697460xoAGmS",
    "1176487pQwyDp",
    "666oxvvLW",
    "password",
    "json",
    "message",
    "email",
    "869clhBau",
    "status",
    "10wdtRGN",
    "name",
    "Internal\x20Sever\x20Error",
    "204009IVeemj",
    "740LOmcDm",
    "sign",
    "3pVYMdb",
    "228uygyor",
    "23408jWpNNm",
    "Oops\x20!\x20Admin\x20does\x20not\x20found\x20with\x20that\x20email.",
    "body",
    "Admin\x20login\x20Successfully.",
    "image",
    "Oops\x20!\x20Password\x20doesn\x27t\x20matched!",
  ];
  _0x56f1 = function () {
    return _0x217b75;
  };
  return _0x56f1();
}

//update admin profile
exports.updateProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      if (req?.body?.image) {
        await deleteFromStorage(req?.body?.image);
      }

      return res.status(200).json({ status: false, message: "Admin does not found!" });
    }

    admin.name = req?.body?.name ? req?.body?.name : admin.name;
    admin.email = req?.body?.email ? req?.body?.email.trim() : admin.email;

    if (req?.body?.image) {
      if (admin?.image) {
        await deleteFromStorage(admin?.image);
      }

      admin.image = req?.body?.image ? req?.body?.image : admin.image;
    }

    await admin.save();

    const data = await Admin.findById(admin._id);
    data.password = cryptr.decrypt(data.password);

    return res.status(200).json({
      status: true,
      message: "Admin profile has been updated.",
      data: data,
    });
  } catch (error) {
    if (req?.body?.image) {
      await deleteFromStorage(req?.body?.image);
    }

    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "admin does not found." });
    }

    const data = await Admin.findById(admin._id);
    data.password = cryptr.decrypt(data.password);

    return res.status(200).json({ status: true, message: "Retrive Admin Profile!", data: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//send email for forgot the password (forgot password)
exports.forgotPassword = async (req, res) => {
  try {
    if (!req.query.email) {
      return res.status(200).json({ status: false, message: "email must be requried." });
    }

    const email = req.query.email.trim();

    const admin = await Admin.findOne({ email: email });
    if (!admin) {
      return res.status(200).json({ status: false, message: "admin does not found with that email." });
    }

    var tab = "";
    tab += "<!DOCTYPE html><html><head>";
    tab += "<meta charset='utf-8'><meta http-equiv='x-ua-compatible' content='ie=edge'><meta name='viewport' content='width=device-width, initial-scale=1'>";
    tab += "<style type='text/css'>";
    tab += " @media screen {@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 400;}";
    tab += "@font-face {font-family: 'Source Sans Pro';font-style: normal;font-weight: 700;}}";
    tab += "body,table,td,a {-ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }";
    tab += "table,td {mso-table-rspace: 0pt;mso-table-lspace: 0pt;}";
    tab += "img {-ms-interpolation-mode: bicubic;}";
    tab +=
      "a[x-apple-data-detectors] {font-family: inherit !important;font-size: inherit !important;font-weight: inherit !important;line-height:inherit !important;color: inherit !important;text-decoration: none !important;}";
    tab += "div[style*='margin: 16px 0;'] {margin: 0 !important;}";
    tab += "body {width: 100% !important;height: 100% !important;padding: 0 !important;margin: 0 !important;}";
    tab += "table {border-collapse: collapse !important;}";
    tab += "a {color: #1a82e2;}";
    tab += "img {height: auto;line-height: 100%;text-decoration: none;border: 0;outline: none;}";
    tab += "</style></head><body>";
    tab += "<table border='0' cellpadding='0' cellspacing='0' width='100%'>";
    tab += "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'>";
    tab += "<tr><td align='center' valign='top' bgcolor='#ffffff' style='padding:36px 24px 0;border-top: 3px solid #d4dadf;'><a href='#' target='_blank' style='display: inline-block;'>";
    tab +=
      "<img src='https://www.stampready.net/dashboard/editor/user_uploads/zip_uploads/2018/11/23/5aXQYeDOR6ydb2JtSG0p3uvz/zip-for-upload/images/template1-icon.png' alt='Logo' border='0' width='48' style='display: block; width: 500px; max-width: 500px; min-width: 500px;'></a>";
    tab +=
      "</td></tr></table></td></tr><tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff'>";
    tab += "<h1 style='margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -1px; line-height: 48px;'>SET YOUR PASSWORD</h1></td></tr></table></td></tr>";
    tab +=
      "<tr><td align='center' bgcolor='#e9ecef'><table border='0' cellpadding='0' cellspacing='0' width='100%' style='max-width: 600px;'><tr><td align='center' bgcolor='#ffffff' style='padding: 24px; font-size: 16px; line-height: 24px;font-weight: 600'>";
    tab += "<p style='margin: 0;'>Not to worry, We got you! Let's get you a new password.</p></td></tr><tr><td align='left' bgcolor='#ffffff'>";
    tab += "<table border='0' cellpadding='0' cellspacing='0' width='100%'><tr><td align='center' bgcolor='#ffffff' style='padding: 12px;'>";
    tab += "<table border='0' cellpadding='0' cellspacing='0'><tr><td align='center' style='border-radius: 4px;padding-bottom: 50px;'>";
    tab +=
      "<a href='" +
      process?.env?.baseURL +
      "/changePassword?id=" +
      `${admin._id}` +
      "' target='_blank' style='display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 4px;background: #FE9A16; box-shadow: -2px 10px 20px -1px #33cccc66;'>SUBMIT PASSWORD</a>";
    tab += "</td></tr></table></td></tr></table></td></tr></table></td></tr></table></body></html>";

    const resend = new Resend(settingJSON?.resendApiKey);
    const response = await resend.emails.send({
      from: process?.env?.EMAIL,
      to: email,
      subject: `Sending email from ${process?.env?.projectName} for Password Security`,
      html: tab,
    });

    if (response.error) {
      console.error("Error sending email via Resend:", response.error);
      return res.status(500).json({ status: false, message: "Failed to send email", error: response.error.message });
    }

    return res.status(200).json({ status: true, message: "Email has been successfully sent!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//update password
exports.updatePassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "admin does not found." });
    }

    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    if (cryptr.decrypt(admin.password) !== String(req.body.oldPass)) {
      return res.status(200).json({
        status: false,
        message: "Oops! Password doesn't match!",
      });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).json({
        status: false,
        message: "Oops! New Password and Confirm Password don't match!",
      });
    }

    const hash = cryptr.encrypt(req.body.newPass);
    admin.password = hash;

    const [savedAdmin, data] = await Promise.all([admin.save(), Admin.findById(admin._id)]);

    data.password = cryptr.decrypt(savedAdmin.password);

    return res.status(200).json({
      status: true,
      message: "Password has been changed by the admin.",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//set Password
exports.setPassword = async (req, res) => {
  try {
    const admin = await Admin.findById(req?.admin._id);
    if (!admin) {
      return res.status(200).json({ status: false, message: "Admin does not found." });
    }

    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(200).json({
        status: false,
        message: "Oops! New Password and Confirm Password don't match!",
      });
    }

    admin.password = cryptr.encrypt(newPassword);
    await admin.save();

    admin.password = cryptr.decrypt(admin?.password);

    return res.status(200).json({
      status: true,
      message: "Password has been updated Successfully.",
      data: admin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

// auto import playlist
const play = require("play-dl");
const Category = require("../../models/category.model");
const MovieSeries = require("../../models/movieSeries.model");
const ShortVideo = require("../../models/shortVideo.model");

exports.autoImportPlaylist = async (req, res) => {
  try {
    const { playlistUrl, categoryName = "Drama" } = req.body;
    if (!playlistUrl) {
      return res.status(200).json({ status: false, message: "Playlist URL is required!" });
    }

    const playlist = await play.playlist_info(playlistUrl, { incomplete: true });
    if (!playlist || !playlist.videos || playlist.videos.length === 0) {
      return res.status(200).json({ status: false, message: "No videos found in this playlist." });
    }

    const seriesTitle = playlist.title || "Imported Web Series";
    const seriesDesc = playlist.description || `Auto-imported series from YouTube with ${playlist.videos.length} episodes.`;
    const bannerUrl = (playlist.thumbnail && playlist.thumbnail.url) || (playlist.videos[0]?.thumbnails[0]?.url) || "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800";
    const thumbUrl = (playlist.videos[0]?.thumbnails[0]?.url) || bannerUrl;

    let category = await Category.findOne({ name: new RegExp(`^${categoryName}$`, "i") });
    if (!category) {
      category = await Category.create({
        name: categoryName,
        uniqueId: `CAT-${categoryName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        isActive: true,
      });
    }

    const movieSeries = await MovieSeries.create({
      category: category._id,
      name: seriesTitle,
      description: seriesDesc,
      banner: bannerUrl,
      thumbnail: thumbUrl,
      type: 2,
      maxAdsForFreeView: 2,
      releaseDate: new Date(),
      isTrending: true,
      isAutoAnimateBanner: true,
      isActive: true,
    });

    const episodes = playlist.videos.map((v, i) => {
      const isLocked = i >= 3;
      const epThumb = v.thumbnails && v.thumbnails.length > 0 ? v.thumbnails[v.thumbnails.length - 1].url : thumbUrl;
      return {
        movieSeries: movieSeries._id,
        episodeNumber: i,
        videoImage: epThumb,
        videoUrl: v.url || `https://www.youtube.com/watch?v=${v.id}`,
        duration: v.durationInSec || 60,
        coin: isLocked ? 20 : 0,
        isLocked: isLocked,
        releaseDate: new Date(),
      };
    });

    await ShortVideo.insertMany(episodes);

    return res.status(200).json({
      status: true,
      message: `Successfully imported "${seriesTitle}" with ${episodes.length} episodes!`,
      data: {
        seriesId: movieSeries._id,
        title: seriesTitle,
        totalEpisodes: episodes.length,
      },
    });
  } catch (error) {
    console.error("Auto import error:", error);
    return res.status(500).json({ status: false, message: error.message || "Failed to auto-import playlist." });
  }
};
