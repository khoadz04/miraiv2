const fs = require("fs-extra");
const login = require("fca-unofficial");
const readline = require("readline");
const totp = require("totp-generator");

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const option = {
	logLevel: "silent",
	forceLogin: true,
	userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36"
};

//Hãy điền tài khoản và mật khẩu vào file .env sau khi đã đổi .env.example thành .env
let obj, otpkey;
try {
	const config = require("./config.json");
	obj = {
		email: config.EMAIL,
		password: config.PASSWORD
	};
	otpkey = config.OTP_KEY.trim();
} catch (error) {
	obj = {
		email: process.env.EMAIL,
		password: process.env.PASSWORD
	};
	otpkey = process.env.OTP_KEY.trim();
}

console.log(obj)

login(obj, option, (err, api) => {
	if (err) {
		switch (err.error) {
			case "login-approval":
				if (otpkey) err.continue(totp(otpkey));
				else {
					console.log("Nhập mã xác minh 2 lớp:");
					rl.on("line", line => {
						err.continue(line);
						rl.close();
					});
				}
				break;
			default:
			console.error(err);
			process.exit(1);
		}
		return;
	}
	var json = JSON.stringify(api.getAppState(), null, "\t");
	var addNew = fs.createWriteStream(__dirname + "/appstate.json", { flags: "w" });
	addNew.write(json);
	console.log("Đã ghi xong appstate!");
	//process.exit(1);
});
