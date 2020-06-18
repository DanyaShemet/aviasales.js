const formSearch = document.querySelector('.form-search'),
    inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
    dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
    inputCitiesTo = formSearch.querySelector('.input__cities-to'),
    dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
    inputDateDepart = formSearch.querySelector('.input__date-depart'),
    cheapestTicket = document.querySelector('#cheapest-ticket'),
    otherCheapTickets = document.querySelector('#other-cheap-tickets'),
    errorTicket = document.querySelector('#error-ticket'),
    moreBtn = document.querySelector('.more__btn');

let countOfTickets = 10;

const CITY_API = 'data/cities.json';
const PROXY = 'https://cors-anywhere.herokuapp.com/';
const API_KEY = '4bd6e9439a22854ff33560b31b0c6120';
const CALENDAR = 'http://min-prices.aviasales.ru/calendar_preload';

let city = [];

function getData(url, callback) {
    //fetch(url).then(response  => response.status === 200 ? response.json() : throw new Error('Нет таких городов, введи другие')).catch(e => createErrorBlock(e)).then(data => callback(data))
    fetch(url).then(response  => {
        if (response.status === 200) return response.json()
        throw new Error('Нет таких городов, введи другие')})
        .catch(e => createErrorBlock(e)).then(data => callback(data))
}

const showCity = (input, list) => {
    list.textContent = '';
    if (input.value !== '') {
        const filterCity = city.filter((el, i) => {
            return el.name.toLowerCase().startsWith(input.value.toLowerCase())
        });

        filterCity.forEach((el) => {
            const li = document.createElement('li');
            li.classList.add('dropdown__city');
            li.textContent = el.name;
            list.append(li);

        })
    }
};
const getCity = (e, input, list) => {
    const target = e.target;
    if (target.tagName === 'LI') {
        input.value = target.innerText;
        list.textContent = '';
    }
};

const getChanges = (num) => {
    if (num) {
        return num === 1 ? 'Количество пересадок - 1' : 'Количество пересадок - 2'
    }else{
        return 'Без пересадок'
    }
};

const createBlock = (data) => {
    let deep = '';
    const ticket = document.createElement("article")
    ticket.classList.add('ticket')
        if (data) {
            deep = `
            <h3 class="agent">${data.gate}</h3>
            <div class="ticket__wrapper">
                  <div class="left-side">
                  <a href="https://www.aviasales.ru/search/SVX2905KGD1" class="button button__buy">Купить
                  за ${data.value} ₽</a>
                </div>
                <div class="right-side">
                  <div class="block-left">
                  <div class="city__from">Вылет из города
                  <span class="city__name">${getNameCity(data.origin)}</span>
                </div>
                <div class="date">${getDate(data.depart_date)}</div>
            </div>
                <div class="block-right">
                    <div class="changes">${getChanges(data.number_of_changes)}</div>
                    <div class="city__to">Город назначения:
                      <span class="city__name">${getNameCity(data.destination)}</span>
                    </div>
                </div>
              </div>
            </div> `;
        } else {
            deep = '<h3>К сожалению на текущую дату нет билетов</h3>'
        }
        ticket.insertAdjacentHTML('afterbegin', deep)


    return ticket;
};

function createErrorBlock(e) {
    errorTicket.style.display = 'block'
}

const getNameCity = (code) => {
    return city.find(el => el.code === code).name;
};

const getDate = (date) => {
    return new Date(date).toLocaleDateString('ru', {year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"})
}

const renderCheapDay = (ticket) => {
    cheapestTicket.style.display = 'block';
    cheapestTicket.innerHTML ='<h2>Самый дешевый билет на выбранную дату</h2>';
    const cheapestTicketObject = createBlock(ticket[0]);
    cheapestTicket.append(cheapestTicketObject)
};

const renderCheapYear = (tickets, countOfTickets) => {
    otherCheapTickets.style.display = 'block';
    moreBtn.style.display = 'block';
    otherCheapTickets.innerHTML = '<h2>Самые дешевые билеты на другие даты</h2>';
    tickets.sort((a, b) => a.value - b.value);
    // tickets.sort((a, b) => {
    //     if (a.depart_date > b.depart_date) {
    //         return 1
    //     }
    //     if (a.depart_date < b.depart_date) {
    //         return -1
    //     }
    //     return 0
    // });
    for(let i = 0;i<countOfTickets;i++){
        const cheapestTicketsObject = createBlock(tickets[i]);
        otherCheapTickets.append(cheapestTicketsObject)
    }
};
const renderCheap = (data, date) => {
    const cheaperTicket = data.best_prices;
    const cheapTicketPerDay = cheaperTicket.filter(el => el.depart_date === date);

    renderCheapDay(cheapTicketPerDay);
    renderCheapYear(cheaperTicket,countOfTickets)
    moreBtn.onclick = () => {
        countOfTickets += 10;
        renderCheapYear(cheaperTicket,countOfTickets)
    }
};

inputCitiesFrom.addEventListener('input', () => {
    showCity(inputCitiesFrom, dropdownCitiesFrom)
});
inputCitiesTo.addEventListener('input', () => {
    showCity(inputCitiesTo, dropdownCitiesTo)
});

dropdownCitiesFrom.addEventListener('click', (e) => {
    getCity(e, inputCitiesFrom, dropdownCitiesFrom)
});

dropdownCitiesTo.addEventListener('click', (e) => {
    getCity(e, inputCitiesTo, dropdownCitiesTo)
});

formSearch.addEventListener('submit', (e) => {
    e.preventDefault();

    const cityFrom = city.find(el => inputCitiesFrom.value === el.name);
    const cityTo = city.find(el => inputCitiesTo.value === el.name);
    const formData = {
        cityFrom,
        cityTo,
        when: inputDateDepart.value
    };
    if (cityFrom && cityTo) {
        const requestData = `?depart_date=${formData.when}&origin=${formData.cityFrom.code}&destination=${formData.cityTo.code}&one_way=true&token=${API_KEY}`;
        getData(PROXY + CALENDAR + requestData, (response) => {
                renderCheap(response, formData.when)
        })
    } else {
        alert('Введите коректное название города')
    }
});

getData(CITY_API, (data) => {
    city = data.filter(el => el.name);
    city.sort((a, b) => {
        if (a.name > b.name) {
            return 1
        }
        if (a.name < b.name) {
            return -1
        }
        return 0
    });
});
