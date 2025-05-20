import React, { useRef, useState, useEffect } from 'react';
import './App.css';

// Rozszerzenie typu Window
declare global {
  interface Window {
    canvasResult?: HTMLCanvasElement | null;
  }
}

interface Task {
  title: string;
  description: string;
  testCode: string;
  expectedOutput: string;
  defaultCode?: string;
}

const tasks: Task[] = [
    {
      "title": "Zadanie 1: Zmienna",
      "description": "Utwórz zmienną o nazwie \"x\" i przypisz jej wartość 5. Wypisz ją w konsoli.",
      "testCode": "let x = 5; console.log(x);",
      "expectedOutput": "5",
      "defaultCode": "let x = 10; // Deklaruje zmienną \"x\" i przypisuje jej wartość 10 (liczba całkowita)\nconsole.log(x); // Wypisuje aktualną wartość zmiennej \"x\" w konsoli (czyli 10)"
    },
    {
      "title": "Zadanie 2: Dodawanie",
      "description": "Utwórz zmienne a = 3 i b = 4, wypisz ich sumę.",
      "testCode": "let a = 3; let b = 4; console.log(a + b);",
      "expectedOutput": "7",
      "defaultCode": "let a = 2; // Tworzy zmienną \"a\" z wartością 2\nlet b = 6; // Tworzy zmienną \"b\" z wartością 6\nconsole.log(a + b); // Dodaje a i b (2 + 6) i wypisuje wynik w konsoli (czyli 8)"
    },
    {
      "title": "Zadanie 3: Funkcja",
      "description": "Napisz funkcję dodaj, która zwraca sumę dwóch liczb. Wywołaj ją z argumentami 2 i 2.",
      "testCode": "function dodaj(a, b) { return a + b; } console.log(dodaj(2, 2));",
      "expectedOutput": "4",
      "defaultCode": "function dodaj(a, b) {\n  return a + b; // Funkcja zwraca sumę dwóch argumentów\n}\nlet wynik = dodaj(5, 3); // Wywołanie funkcji z argumentami 5 i 3, wynik to 8\nconsole.log(wynik); // Wypisuje wynik działania funkcji (czyli 8)"
    },
    {
      "title": "Zadanie 4: Warunek",
      "description": "Utwórz zmienną \"liczba = 10\" i wypisz \"Tak\", jeśli liczba to 10.",
      "testCode": "let liczba = 10; if(liczba === 10) console.log(\"Tak\");",
      "expectedOutput": "Tak",
      "defaultCode": "let liczba = 15; // Tworzy zmienną o nazwie \"liczba\" i przypisuje jej wartość 15\nif (liczba > 10) { // Sprawdza, czy liczba jest większa niż 10\n  console.log(\"Liczba jest większa niż 10\"); // Jeśli tak, wypisuje komunikat\n}"
    },
    {
      "title": "Zadanie 5: Pętla for",
      "description": "Wypisz liczby od 1 do 3 za pomocą pętli for (w jednej linii).",
      "testCode": "for(let i=1;i<=3;i++) console.log(i);",
      "expectedOutput": "1\n2\n3",
      "defaultCode": "for (let i = 0; i < 5; i++) { // Pętla wykona się 5 razy od i = 0 do i < 5\n  console.log(\"i = \" + i); // W każdej iteracji wypisze bieżącą wartość i\n}"
    },
    {
      "title": "Zadanie 6: Tablica",
      "description": "Utwórz tablicę z 3 owocami i wypisz pierwszy owoc.",
      "testCode": "let owoce = [\"jabłko\", \"banan\", \"gruszka\"]; console.log(owoce[0]);",
      "expectedOutput": "jabłko",
      "defaultCode": "let owoce = [\"malina\", \"śliwka\", \"truskawka\"]; // Tworzy tablicę z trzema owocami\nconsole.log(\"Pierwszy owoc to: \" + owoce[0]); // Wypisuje pierwszy owoc w tablicy"
    },
    {
      "title": "Zadanie 7: Obiekt",
      "description": "Utwórz obiekt osoba z polem imie = \"Mati\". Wypisz imię.",
      "testCode": "let osoba = { imie: \"Mati\" }; console.log(osoba.imie);",
      "expectedOutput": "Mati",
      "defaultCode": "let osoba = {\n  imie: \"Ania\", // Tworzy właściwość \"imie\" z wartością \"Ania\"\n  wiek: 25 // Dodaje dodatkową właściwość \"wiek\"\n};\nconsole.log(\"Imię to: \" + osoba.imie); // Wypisuje wartość pola \"imie\""
    },
    {
      "title": "Zadanie 8: Funkcja strzałkowa",
      "description": "Napisz funkcję strzałkową, która zwraca przekazany tekst. Wywołaj ją z argumentem \"hej\".",
      "testCode": "const zwroc = (txt) => txt; console.log(zwroc(\"hej\"));",
      "expectedOutput": "hej",
      "defaultCode": "const zwrocTekst = (tekst) => {\n  return \"Użytkownik napisał: \" + tekst; // Zwraca tekst z dodanym opisem\n};\nconsole.log(zwrocTekst(\"hej\")); // Wywołanie funkcji z argumentem \"hej\""
    },
    {
      "title": "Zadanie 9: Metoda push",
      "description": "Utwórz pustą tablicę i dodaj do niej \"pomidor\" za pomocą metody push().",
      "testCode": "let warzywa = []; warzywa.push(\"pomidor\"); console.log(warzywa[0]);",
      "expectedOutput": "pomidor",
      "defaultCode": "let warzywa = []; // Tworzy pustą tablicę o nazwie \"warzywa\"\nwarzywa.push(\"marchewka\"); // Dodaje nowy element do tablicy\nconsole.log(\"Dodano warzywo: \" + warzywa[0]); // Wypisuje pierwszy element tablicy"
    },
    {
      "title": "Zadanie 10: typeof",
      "description": "Utwórz zmienną x = 12 i wypisz jej typ za pomocą typeof.",
      "testCode": "let x = 12; console.log(typeof x);",
      "expectedOutput": "number",
      "defaultCode": "let x = \"tekst\"; // Tworzy zmienną x i przypisuje jej tekst (łańcuch znaków)\nconsole.log(typeof x); // typeof zwraca typ danych zmiennej x – tutaj będzie to \"string\""
    },
    {
      "title": "Zadanie 11: Zmiana koloru tła",
      "description": "Utwórz zmienną color i przypisz jej \"red\". Zmień kolor tła strony na ten kolor.",
      "testCode": "let color = \"red\"; document.body.style.backgroundColor = color;",
      "expectedOutput": "VISUAL_TASK",
      "defaultCode": "let color = \"#00ff00\"; // Ustawia kolor na zielony w zapisie szesnastkowym\n// Poniższa linia zmienia tło strony:\ndocument.body.style.backgroundColor = color;"
    },
    {
      "title": "Zadanie 12: Canvas",
      "description": "Narysuj prostokąt na canvasie o szerokości 100px i wysokości 50px.",
      "testCode": "const canvas = document.createElement(\"canvas\"); const ctx = canvas.getContext(\"2d\"); ctx.fillStyle = \"blue\"; ctx.fillRect(0, 0, 100, 50); window.canvasResult = canvas;",
      "expectedOutput": "CANVAS_TASK",
      "defaultCode": "const canvas = document.createElement(\"canvas\"); // Tworzy element canvas\ncanvas.width = 200; // Ustawia szerokość canvasu na 200 pikseli\ncanvas.height = 100; // Ustawia wysokość canvasu na 100 pikseli\nconst ctx = canvas.getContext(\"2d\"); // Pobiera kontekst do rysowania 2D\nctx.fillStyle = \"green\"; // Wybiera kolor wypełnienia na zielony\nctx.fillRect(50, 25, 100, 50); // Rysuje prostokąt zaczynający się w (50,25), szeroki na 100 i wysoki na 50\nwindow.canvasResult = canvas; // Zapisuje canvas do wyświetlenia w wynikach"
    },
    {
      "title": "Zadanie 13: Generator",
      "description": "Napisz generator \"liczby\", który produkuje liczby 1, 2, 3. Wywołaj go 3 razy i wypisz każdy wynik.",
      "testCode": "function* liczby() { yield 1; yield 2; yield 3; } const gen = liczby(); console.log(gen.next().value); console.log(gen.next().value); console.log(gen.next().value);",
      "expectedOutput": "1\n2\n3",
      "defaultCode": "function* liczby() {\n  // Generator oznaczamy gwiazdką (*) po słowie function\n  yield 4; // yield \"produkuje\" wartość i pauzuje generator\n  yield 5;\n  yield 6;\n}\n\nconst gen = liczby(); // Tworzy instancję generatora\nconsole.log(gen.next().value); // Uruchamia generator do pierwszego yield\nconsole.log(gen.next().value); // Kontynuuje do drugiego yield\nconsole.log(gen.next().value); // Kontynuuje do trzeciego yield"
    }
  ];
  
  

const JavaScriptTutorial: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [currentTask, setCurrentTask] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [code, setCode] = useState(tasks[0].defaultCode || '');
  const [output, setOutput] = useState('');
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

  const runCode = () => {
    try {
      let result = '';
      const print = (msg: any) => {
        result += msg + '\n';
      };

      // Czyść poprzednie wyniki
      window.canvasResult = null;
      setCanvasElement(null);

      const safeCode = code.replace(/console\.log/g, 'print');
      
      eval(safeCode);

      // Jeśli to zadanie Canvas i canvas został utworzony
      if (window.canvasResult) {
        setCanvasElement(window.canvasResult);
        setOutput('Canvas został utworzony');
      } else {
        setOutput(result.trim());
      }
    } catch (err: any) {
      setOutput('❌ Błąd: ' + err.message);
    }
  };

  const checkCanvasTask = () => {
    if (!window.canvasResult) {
      setFeedback('❌ Nie znaleziono canvas. Upewnij się, że tworzysz canvas i zapisujesz go do window.canvasResult');
      return;
    }

    const canvas = window.canvasResult;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setFeedback('❌ Nie można pobrać kontekstu 2D z canvas.');
      return;
    }

    // Sprawdź czy został narysowany prostokąt dokładnie 100x50 zaczynający się od (0,0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Sprawdź czy piksele w obszarze prostokąta mają kolor (nie są przezroczyste)
    let pixelsWithColor = 0;
    let totalExpectedPixels = 0;
    
    // Sprawdź obszar 100x50 pikseli od (0,0)
    for (let y = 0; y < Math.min(50, canvas.height); y++) {
      for (let x = 0; x < Math.min(100, canvas.width); x++) {
        totalExpectedPixels++;
        const index = (y * canvas.width + x) * 4;
        const alpha = data[index + 3]; // kanał alpha
        
        if (alpha > 0) { // piksel nie jest przezroczysty
          pixelsWithColor++;
        }
      }
    }
    
    // Sprawdź czy obszar poza prostokątem jest pusty (dla prostokąta 100x50 od (0,0))
    let pixelsOutsideRect = 0;
    let totalOutsidePixels = 0;
    
    // Sprawdź piksele poza obszarem 100x50
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        // Jeśli piksel jest poza obszarem prostokąta (0,0,100,50)
        if (x >= 100 || y >= 50) {
          totalOutsidePixels++;
          const index = (y * canvas.width + x) * 4;
          const alpha = data[index + 3];
          
          if (alpha > 0) {
            pixelsOutsideRect++;
          }
        }
      }
    }
    
    // Prostokąt powinien wypełniać dokładnie obszar 100x50 od (0,0)
    const expectedPixels = Math.min(100 * 50, totalExpectedPixels);
    const coloredPercentage = (pixelsWithColor / expectedPixels) * 100;
    
    if (coloredPercentage < 90) {
      setFeedback(`❌ Prostokąt nie wypełnia obszaru 100x50. Wykryto tylko ${Math.round(coloredPercentage)}% pikseli. Użyj fillRect(0, 0, 100, 50).`);
    } else if (pixelsOutsideRect > 0) {
      setFeedback('❌ Wykryto piksele poza obszarem 100x50. Prostokąt powinien mieć dokładnie wymiary 100x50 i zaczynać się od (0,0).');
    } else {
      setFeedback('✅ Dobrze! Prostokąt o wymiarach 100x50 został poprawnie narysowany.');
    }
  };

  const checkAnswer = () => {
    const expected = tasks[currentTask].expectedOutput.trim();
    
    // Specjalne sprawdzanie dla Canvas
    if (expected === 'CANVAS_TASK') {
      checkCanvasTask();
      return;
    }
    
    if (expected === 'VISUAL_TASK') {
      setFeedback('✅ Zadanie wykonane! Sprawdź efekt wizualny.');
      return;
    }
    
    // Standardowe sprawdzanie tekstowe
    if (output === expected) {
      setFeedback('✅ Dobrze!');
    } else {
      setFeedback(`❌ Niepoprawnie. Oczekiwano: "${expected}", ale otrzymano: "${output}"`);
    }
  };

  const nextTask = () => {
    const next = currentTask + 1;
    if (next < tasks.length) {
      setCurrentTask(next);
      setCode(tasks[next].defaultCode || '');
      setFeedback('');
      setOutput('');
      setCanvasElement(null);
      window.canvasResult = null;
    } else {
      setFeedback('🎉 Wszystkie zadania ukończone!');
    }
  };

  const task = tasks[currentTask];
  const progressPercent = Math.round(((currentTask + 1) / tasks.length) * 100);

  if (!started) {
    return (
      <div className="main-content loaded">
        <h1>💡 Wprowadzenie do JavaScript</h1>
        <p>Dowiesz się jak działa JS, a potem wykonasz zadania.</p>
        <button className="cta-button" onClick={() => setStarted(true)}>👉 Rozpocznij kurs</button>
      </div>
    );
  }

  return (
    <div className="main-content loaded">
      <div style={{ height: '10px', background: '#333', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ width: `${progressPercent}%`, background: 'lime', height: '100%', transition: 'width 0.5s' }} />
      </div>

      <h2>{task.title}</h2>
      <p>{task.description}</p>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{
          width: '100%',
          height: '180px',
          fontFamily: 'monospace',
          fontSize: '1rem',
          backgroundColor: '#1e1e1e',
          color: 'white',
          border: '1px solid #333',
          marginTop: '2rem',
          borderRadius: '6px',
          padding: '1rem',
          marginBottom: '1rem'
        }}
      />

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="cta-button" onClick={runCode}>▶ Uruchom kod</button>
        <button className="cta-button" onClick={checkAnswer}>✅ Sprawdź</button>
        <button className="cta-button" onClick={nextTask}>➡ Następne</button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>📤 Wynik:</h3>
        <div style={{ 
          backgroundColor: '#111', 
          padding: '1rem', 
          color: 'lime', 
          borderRadius: '6px', 
          minHeight: '60px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap'
        }}>
          {canvasElement && (
            <div style={{ marginBottom: '1rem' }}>
              <canvas 
                ref={(canvas) => {
                  if (canvas && canvasElement) {
                    const ctx = canvas.getContext('2d');
                    const originalCtx = canvasElement.getContext('2d');
                    if (ctx && originalCtx) {
                      canvas.width = canvasElement.width;
                      canvas.height = canvasElement.height;
                      ctx.drawImage(canvasElement, 0, 0);
                    }
                  }
                }}
                style={{ border: '1px solid #333', backgroundColor: 'white' }}
              />
            </div>
          )}
          {output}
        </div>
      </div>

      {feedback && (
        <div style={{ marginTop: '1rem', fontWeight: 'bold', color: feedback.startsWith('✅') ? 'lime' : 'orange', transition: 'all 0.3s ease-in-out' }}>
          {feedback}
        </div>
      )}
    </div>
  );
};

export default JavaScriptTutorial;