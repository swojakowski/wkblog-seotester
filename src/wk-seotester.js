class WKSeoTester {
    constructor(inputString) {
        this.parse(inputString);
        console.log(this);
    }

    parse(html) {

        const el = document.createElement("div");
        el.innerHTML = html;
        this.html = el;

        //paragrafy
        this.p = this.html.querySelectorAll("p");
        //nagłówki h1-h4
        this.h1 = this.html.querySelectorAll("h1");
        this.h2 = this.html.querySelectorAll("h2");
        this.h3 = this.html.querySelectorAll("h3");
        this.h4 = this.html.querySelectorAll("h4");
        //obrazki
        this.img = this.html.querySelectorAll("img");
        //odnośniki
        this.a = this.html.querySelectorAll("a:not(.wk-image__anchor)");

        console.log(this);

        //tablice zdań i wyrazów
        this.sentences = [];
        this.words = [];
        //tymczasowa tablica połączona, aby przeprowadzić operację jedną pętlą
        let arr = [
            ...this.p,
            ...this.h1,
            ...this.h2,
            ...this.h3,
            ...this.h4
        ];

        for (let i = 0; i < arr.length; i++) {
            let temp = this.extractSentences(arr[i]);
            this.sentences = this.sentences.concat(temp);
            //dla wyrazów w locie najpierw łączymy tablicę zdań w jeden ciąg wyrazów rozdzielonych spacjami, następnie rozbijamy go na tablicę po spacjach
            this.words = this.words.concat(temp.join(" ").split(" "));
        }

    }

    extractSentences(element) {
        let str = element.innerText;

        //wszystkie terminatory zdań na kropki
        str = str.replace(/[?!]/g, '.');
        //wielokropki na kropki
        str = str.replace(/\.+/g, '.');
        //usuwanie ew. spacji przed kropkami
        str = str.replace(/ +\./g, '.');
        //usunięcie wszystkich znaków nieliterowych oprócz myślnika i kropki
        str = str.replace(/[^A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż \-\.]/g, '');
        //usunięcie dodatkowych myślników
        str = str.replace(/\-+/g, "-");
        //konwersja myślnika na spację
        str = str.replace(/\-/g, ' ');
        //usunięcie dodatkowych spacji
        str = str.replace(/\s+/g, " ");

        //wykrycie miejsca, w którym kończy się jedno zdanie i zaczyna następne,
        //wstawienie tam zlepka znaków, po którym bezpiecznie będzie można podzielić później string na zdania i wyrazy
        str = str.replace(/(?<=[a-ząęćłńóźż])\.\s*(?=[A-ZŚŁŻŹÓ])/g, '$5$');

        //usunięcie pozostałych kropek (po skrótach i ostatnim zdaniu)
        str = str.replace(/\./g, '');

        //zwrócenie tablicy z oczyszczonymi zdaniami, rozbicie przygotowanego stringa po zlepku '$5$'
        return str.split("$5$");
    }



    // =================================

    // ++++++     TESTY      ++++++++

    // =================================

    //TEST NA CZYTELNOŚĆ TEKSTU
    readabilityTest(){ 

        //ZMIENNA PRZECHOWUJĄCA ILOŚĆ SŁÓW TRUDNYCH (DŁUGICH)  
        let hardWords = 0;
    
        for(let i = 0; i < this.words.length; i++){
            let w = this.words[i];
    
            //ROZDZIELANIE SŁOWA NA SYLABY
            let r = w.match(/[aąeęoóuyi]{1,2}/g);
            if(r == null) r = [];
    
            if(r.length >= 4) hardWords += 1;
        }
    
        let result = 0.4 * ((this.words.length / this.sentences.length) + 100 * (hardWords / this.words.length));
    
        if(result > 15){
            return {
                status: "NOK",
                msg: "Twój tekst jest trudny do przeczytania. Masz: " + result.toFixed(2) + " pkt. Przedział 'zły': > 15"
            }
        }
        if(result >= 12 && result <= 15){
            return {
                status: "AVG",
                msg: "Twój tekst jest przeciętny w łatwości czytania. Masz: " + result.toFixed(2) + " pkt. Przedział 'przeciętny': (lepiej) 12-15 (gorzej)"
            }
        }
        if(result < 12){
            return {
                status: "OK",
                msg: "Twój tekst jest łatwy do przeczytania. Masz: " + result.toFixed(2) + " pkt. Przedział 'dobry': < 12"
            }
        }
    }

    //TEST NA WYSTĘPOWANIE NAGŁÓWKÓW RÓŻNEGO TYPU
    headingsTest(){
        let h2,h3,h4;
        h2=h3=h4=0;
    
        h2 = (this.h2.length > 0 )? 1:0;
        h3 = (this.h3.length > 0 )? 1:0;
        h4 = (this.h4.length > 0 )? 1:0;
    
    
        var sum= h2 + h3 + h4;
    
        if(sum <= 1){
            return {
                status: "NOK",
                msg: "Masz tylko "+sum+" rodzajów nagłówków. Rozważ zmianę, tak aby był przynajmniej jeden h2 oraz jeden h3 lub h4"
            }
        }
        else if(sum == 2 && h2 == 0){
            return {
                status: "AVG",
                msg: "Masz "+sum+" rodzaje nagłówków nagłówków, ale żandego h2. Rozważ dodanie nagłówka h2 i lepszą strukturyzację tekstu."
            }
        }
        else{
            return {
                status: "OK",
                msg: "Posiadasz kilka rodzajów nagłówków, bardzo dobrze!"
            }
        }
    }

    //TEST NA STOSUNEK AKAPITÓW DO NAGŁÓWKÓW
    headingsRatioTest(){
        let sumh = this.h1.length + this.h2.length + this.h3.length + this.h4.length;
        let sump = this.p.length;
    
        let result = sumh/sump;
    
        if(result < 0.25 || result >= 0.80){
            return {
                status: "NOK",
                msg: "Twój stosunek nagłówków do akapitów jest zły. Pownien być większy niz 0.25 i mniejszy niz 0.80 (aktualnie: " + result.toFixed(2) + ")"
            }
        }
    
        if(result >= 0.25 && result < 0.80){
            return {
                status: "OK",
                msg: "Twój stosunek nagłówków do akapitów jest dobry - nie przekracza 0.80 i nie spada ponizej 0.25 (aktualnie: " +result.toFixed(2) + ")"
            }
        }
    }

    //TEST NA DŁUGOŚĆ AKAPITÓW
    paragraphsLenghtTest(){
        let b = 0; //licznik akapitów >150 słów
    
        for(let i =0; i< this.p.length ; i++){
            if(this.p[i].innerText.split(" ").length > 150){
                b++;
            }
        }
    
        if(b < 1)return {
            status: "OK",
            msg: "Nie posiadasz akapitów dłuzszych niz 150 słów. Bardzo dobrze!"
        }
        if(b>=1)return {
            status: "NOK",
            msg: "Twój tekst posiada: " + b + " akapitów dłuzszych niz 150 słów. Powinieneś to poprawić"
        }
    }


    //TEST NA DŁUGOŚĆ ZDAŃ
    sentencesLengthTest(){
        let b = 0; //ilość zdań dłuższych niż 25 słów 
      
        for(let i = 0; i< this.sentences.length ; i++){
            if(this.sentences[i].split(" ").length > 25){
                b++;
            }
        }
      
        let result  = b / this.sentences.length * 100; //obliczenie ile % zdań stanowią zdania długie
      
        if(result > 25){
            return {
                status: "NOK",
                msg: "Twój tekst posiada: "+ b + " zdań (" + result.toFixed(2) + "% objętości tekstu) dłuższych niż 25 słów. Powinieneś to poprawić!"
            }
        }
        else{
            return {
                status: "OK",
                msg: "Twój tekst posiada: " + b + " zdań (" + result.toFixed(2) + "% objętości tekstu) dłuższych niż 25 słów. Jest dobrze!"
            }
        }
    }

    //TEST NA DŁUGOŚĆ TEKSTU
    textLenghtTest(){
        if(this.words.length < 300){
            return{
                status: "NOK",
                msg: "Twój tekst powinien mieć więcej niz 300 słów! Aktualnie: "+ this.words.length
            }
        }
        else if(this.words.length == 300){
            return{
                status: "AVG",
                msg: "Twój tekst powinien mieć więcej niz 300 słów! Aktualnie: "+ this.words.length
            }
        }
        else{
            return{
                status: "OK",
                msg: "Twój tekst ma więcej niz 300 słów! Aktualnie: "+ this.words.length
            }
        }
    }

    //TEST NA LINKI WEWNĘTRZNE
    innerLinksTest(){
        let links = this.a;
      
        let b = 0; //ilość linków wewnętrznych 
    
        for(let i = 0; i < links.length; i++){
            if(
                links[i].href.toLowerCase().includes('wirtuozikodu.pl') //czy zawiera nazwę domenową (naszą) 
                || 
                (
                    !links[i].href.toLowerCase().includes('http://') 
                        && 
                    !links[i].href.toLowerCase().includes('https://') //czy nie zawiera protokołu http lub https - link wewnętrzny
                )
            ){
                b++;
            } 
        }
        if(b == 0 ){
            return {
                status:"NOK",
                msg: "Twój tekst nie posiada linków wewnętrznych!"
            }
        }
        if(b == 1 ){
            return {
                status:"AVG",
                msg: "Twój tekst posiada " + b + " link wewnętrzny!"
            }
        }
        if(b > 1 ){
            return {
                status:"OK",
                msg: "Twój tekst posiada " + b + " linków wewnętrznych!"
            }
        }
    }
}