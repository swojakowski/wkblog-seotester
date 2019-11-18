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
}