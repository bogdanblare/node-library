const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.author_list = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Author list");
  const allAuthors = await Author.find().sort({ family_name: 1 }).exec();

  res.render("author_list", { title: "Authors List", author_list: allAuthors });
});

exports.author_detail = asyncHandler(async (req, res, next) => {
  // res.send(`NOT IMPLEMENTED: Author detail: ${req.params.id}`);
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_detail", {
    title: "Author Detail",
    author: author,
    author_books: allBooksByAuthor,
  });
});

// Display Author create form on GET.
exports.author_create_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Author create GET");
  res.render("author_form", { title: "Create Author" });
});

// Handle Author create on POST.
exports.author_create_post = [
  // res.send("NOT IMPLEMENTED: Author create POST");
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified")
    .isAlphanumeric()
    .withMessage("first name has non alphanumeric characters"),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty) {
      res.render("author_form", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      await author.save();
      res.redirect(author.url);
    }
  }),
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Author delete GET");
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);
  if (author === null) {
    redirect("/catalog/authors");
  }

  res.render("author_delete", {
    title: "Delete Author",
    author: author,
    author_books: allBooksByAuthor,
  });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Author delete POST");
  // Get details of author and all their books (in parallel)
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (allBooksByAuthor.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await Author.findByIdAndRemove(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  // res.send("NOT IMPLEMENTED: Author update GET");
  const author = await Author.findById(req.params.id).exec();
  res.render("author_form", { title: "Update author", author: author });
});

// Handle Author update on POST.
exports.author_update_post = [
  body("first_name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must contain atleast 3 characters")
    .isAlphanumeric()
    .withMessage("first name has non alphanumeric characters")
    .escape(),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Family name must alteast contain 1 character")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters.")
    .escape(),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    // res.send("NOT IMPLEMENTED: Author update POST");
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author",
        author: author,
        errors: errors.array(),
      });
    } else {
      const updatedAuthor = await Author.findByIdAndUpdate(
        req.params.id,
        author,
        {}
      );
      res.redirect(updatedAuthor.url);
    }
  }),
];
