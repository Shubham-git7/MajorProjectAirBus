const User = require("../models/user");


module.exports.signup =async (req, res) => {
    try {
      let { username, email, password } = req.body; //humne ye signup wale page se aquire kiye hai
      const newUser = new User({ email, username }); // ye hamara new user ho gaya ab ham is new userd ko save karwane ke liye databsase ke andar hum likhge .. 
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
  
      req.login(registeredUser, (err)=>{
        if(err){
          return next(err);
        }
        req.flash("success", "welcome back to Wonderlust");
        res.redirect("/listings");
      });
     
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup")
    }
  };



  module.exports.renderSignupForm  = (req, res) => {
    res.render("users/signup.ejs");
  };

  module.exports.renderLoginForm =  (req, res) => {
    res.render("users/login.ejs");
  };

  
  module.exports.login= async (req, res) => {
    req.flash("success", "welcome to wanderlust! you are logged in!!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  };

  module.exports.logout= (req, res, next)=>{
    req.logout((err)=>{
      if (err){
        return next(err);
      }
      req.flash("success", "you are logged out!!");
      res.redirect("/listings");
    });
  };