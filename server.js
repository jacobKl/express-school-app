const express = require("express");
const app = express();
const PORT = 3001;
const path = require("path");
const bodyParser = require("body-parser")

const tab = [
    { id: 1, log: "AAA", pass: "PASS1", wiek: 10, uczen: "checked", plec: "m" },
    { id: 2, log: "Jakub", pass: "PASS2", wiek: 17, uczen: "checked", plec: "m" },
    { id: 3, log: "XYZ", pass: "PASS2", wiek: 19, uczen: "null", plec: "k" },
]

let receivedRegister = {};
let free;
let logged = false;
let sortType = 'asc';

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


app.listen(process.env.PORT || 3000)

app.use(express.static('static'))

app.get("/", (req,res) => {
    res.sendFile( path.join(__dirname + "/static/views/main.html") )
})

app.get("/register", (req,res) => {
    if( free == null ){
        res.sendFile( path.join(__dirname + "/static/views/register.html") )
    }else if( free ){
        tab.push({ id: tab.length + 1, log: receivedRegister.login, pass: receivedRegister.pass, wiek: receivedRegister.age, uczen: receivedRegister.student, plec: receivedRegister.gender })
        res.send(`Zarejestrowano uzytkownika ${receivedRegister.login}`)
        free=null
    }else if( !free ){
        receivedRegister = {}
        free = null;
        res.send("nie udalo sie zarejestrowac, sprobuj ponownie, twoja nazwa jest juz w bazie")
    }
})

app.post("/register", (req,res) => {
    receivedRegister = req.body
    let can = tab.filter( item => item.log == receivedRegister.login);
    can.length == 1 ? free = false : free = true
    res.redirect("/register")
})


app.get("/login", (req,res) => {
    res.sendFile(path.join(__dirname + "/static/views/login.html"))
})

app.post("/login", (req,res) => {
    const user = tab.filter( item => item.log == req.body.login )
    user[0].pass == req.body.pass ? logged = true : logged = false
    res.redirect("/admin")
})

app.get("/admin", (req,res) => {
    logged ? res.sendFile(path.join(__dirname + "/static/views/admingood.html")) : res.sendFile(path.join(__dirname + "/static/views/admin.html"));
})

app.get("/show", (req,res) => {
    if ( logged ){
        let result = '<link rel="stylesheet" href="css/style.css"/><div class="subpageBar"><a class="link" href="/sort">sort</a><a class="link" href="/gender">gender</a><a class="link" href="/show">show</a></div><table class="table">';

        tab.forEach( user =>{
            result += `<tr class='row' ><td class='cell'>id: ${user.id}</td><td class='cell'>user: ${user.log} - ${user.pass}</td><td class='cell'>wiek: ${user.wiek}</td>`
            if( user.uczen == "checked" ){
                result += `<td class='cell'>uczen: <input type='checkbox' checked disabled /></td>`
            }else{
                result += `<td class='cell'>uczen: <input type='checkbox' blocked disabled /></td>`
            }
            result+=`<td class='cell'>płeć: ${user.plec}</td></tr>`
        })

        result+='</table>'

        res.send(result);
    }else{
        res.redirect("/admin")
    }
})

app.get("/gender", (req,res) => {
    if( logged ){
        let result = '<link rel="stylesheet" href="css/style.css"/><div class="subpageBar"><a class="link" href="/sort">sort</a><a class="link" href="/gender">gender</a><a class="link" href="/show">show</a></div><table class="table">';

        let part = tab.filter( user => user.plec == "k");

        part.forEach( user =>{
            result += `<tr class='row' ><td class='cell'>id: ${user.id}</td><td class='cell'>płeć: ${user.plec}</td></tr>`
        })

        result+='</table>'

        part = tab.filter( user => user.plec == "m");

        result+='<table class="table">'

        part.forEach( user =>{
            result += `<tr class='row' ><td class='cell'>id: ${user.id}</td><td class='cell'>płeć: ${user.plec}</td></tr>`
        })
        result+='</table>'

        res.send(result);
    }else{
        res.redirect("/admin")
    }
})

app.get("/sort", (req,res) => {
        if ( logged ){
            let result = `<link rel="stylesheet" href="css/style.css"/><div class="subpageBar"><a class="link" href="/sort">sort</a><a class="link" href="/gender">gender</a><a class="link" href="/show">show</a></div><form method="POST" action="/sort" onChange="this.submit()">`;
        let n = [];

        if( sortType == "asc"){
            n = tab.sort((a,b) => parseFloat(a.wiek) - parseFloat(b.wiek));
            result += 'malejąco <input type="radio" name="sort" value="desc" /> rosnąco <input type="radio" name="sort" value="asc" checked />';
        }else{
            n = tab.sort((a,b) => parseFloat(b.wiek) - parseFloat(a.wiek));
            result += 'malejąco <input type="radio" name="sort" value="desc" checked /> rosnąco<input type="radio" name="sort" value="asc" />';
        }

        result += '</form><table class="table">';

        n.forEach( user =>{
            result += `<tr class='row' ><td class='cell'>id: ${user.id}</td><td class='cell'>user: ${user.log} - ${user.pass}</td><td class='cell'>wiek: ${user.wiek}</td>`
            if( user.uczen == "checked" ){
                result += `<td class='cell'>uczen: <input type='checkbox' checked disabled /></td>`
            }else{
                result += `<td class='cell'>uczen: <input type='checkbox' blocked disabled /></td>`
            }
            result+=`<td class='cell'>płeć: ${user.plec}</td></tr>`
        })

        result+="</table>"

        res.send(result)
    }else{
        res.redirect("/admin")
    }
})

app.post("/sort", (req,res) => {
    sortType = req.body.sort
    res.redirect("/sort")
})

app.get("/logout", (req,res) => {
    logged = false
    res.redirect("/")
})