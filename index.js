const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set('strictQuery', true);
const { redirect } = require("statuses");

const app = express();
app.use

// const items =  ["buy food", "cook food", "eat food"];
const workItem = [];



app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://todos1:todos1@cluster0.dxk5es2.mongodb.net/todos").then(() => {
    console.log("mongodb server connected")
}).catch((err) => {
    console.log(err)
})

const itemsSchema = new mongoose.Schema({

    name: String

});


const Item = new mongoose.model("Item", itemsSchema);

const item1 = new Item({

    name: "welcome to your todolist!"

});
const item2 = new Item({

    name: "hit the + button to add a new item."

});
const item3 = new Item({

    name: "<-- hit this to delete an item"

});


const defaultItem = [item1, item2, item3];

const listSchema = ({

    name: String,
    items: [itemsSchema]

});


const List = mongoose.model("List", listSchema);




app.get("/", (req, res) => {

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(
                defaultItem
            ).then(function () {
                console.log("Data inserted")
            }).catch(function (err) {
                console.log(err)
            });
            res.redirect("/")
        } else
            res.render("list", { listTitle: "Today", newItems: foundItems })
    });

});


app.post("/", (req, res) => {

    const itemName = req.body.newItems;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/")
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

});






app.get('/:coustomListName', function (req, res) {
    const coustomListName = _.capitalize(req.params.coustomListName);

    List.findOne({ name: coustomListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: coustomListName,
                    items: defaultItem
                });
                list.save();
                res.redirect("/" + coustomListName)

            } else {
                res.render("list", { listTitle: foundList.name, newItems: foundList.items })
            }
        }
    })
});

app.post("/delete", (req, res) => {
    const checkedId = req.body.checkbox;
    const listName = req.body.listName;


    if (listName === "Today") {


        Item.findByIdAndRemove(checkedId, function (err) {
            if (!err) {
                console.log("Removed")
                res.redirect("/")
            }
        });

    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName)
            }

        });

    }
});


        

app.listen(3000, () => {
    console.log("Port 3000 is running")
});