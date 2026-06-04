import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

export interface MenuItem {
    id: number;
    title: string;
    price: number;
    category: string;
    desc: string;
    isAvailable: boolean;
    img_url: string;
}

@Injectable()
export class MenuService implements OnModuleInit {
    // Інжектуємо PrismaService для роботи з PostgreSQL
    constructor(private readonly prisma: PrismaService) { }

    // Автоматичне заповнення бази даних (Seed) при першому старті додатка
    async onModuleInit() {
        const count = await this.prisma.menuItem.count();
        if (count === 0) {
            console.log('Початкове заповнення бази даних меню (Seeding)...');
            await this.prisma.menuItem.createMany({
                data: [
                    {
                        id: 1,
                        title: 'Борщ український з пампушками',
                        price: 165,
                        category: 'soup',
                        desc: 'Насичений м\'ясний борщ за старовинним рецептом із часниковими пампушками.',
                        isAvailable: true,
                        img_url: 'https://f.authenticukraine.com.ua/photo/5397/RreAz.jpg'
                    },
                    {
                        id: 2,
                        title: 'Крем-суп грибний',
                        price: 140,
                        category: 'soup',
                        desc: 'Ніжний суп-пюре з печериць та білих грибів із вершками.',
                        isAvailable: true,
                        img_url: 'https://art-lunch.ru/content/uploads/2017/01/mushroom_cream_soup_00.jpg'
                    },
                    {
                        id: 3,
                        title: 'Юшка рибна з лососем',
                        price: 185,
                        category: 'soup',
                        desc: 'Прозорий бульйон із філе лосося, картоплею та зеленню.',
                        isAvailable: true,
                        img_url: 'https://shuba.life/static/content/thumbs/1824x912/e/48/22dpi3---c2x1x50px50p-up--dd6c4ad918eab09040124eb7b7e6c48e.jpg'
                    },
                    {
                        id: 4,
                        title: 'Том Ям з морепродуктами',
                        price: 210,
                        category: 'soup',
                        desc: 'Тайський гострий суп із кокосовим молоком, креветками та грибами.',
                        isAvailable: true,
                        img_url: 'https://images.gastronom.ru/DUl45LMuJnbNOvh4JT0djzyX-7CVow51FMyyYpQg7xc/pr:recipe-cover-image/g:ce/rs:auto:0:0:0/L2Ntcy9hbGwtaW1hZ2VzLzI5MGVlMDA4LTNmNjItNDRmNC1hZDJiLTA0OTViZjY3M2QxNy5qcGc.webp'
                    },
                    {
                        id: 5,
                        title: 'Гаспачо томатне',
                        price: 125,
                        category: 'soup',
                        desc: 'Холодний іспанський суп зі свіжих помідорів, огірка та болгарського перцю.',
                        isAvailable: true,
                        img_url: 'https://www.russianfood.com/dycontent/images_upl/678/big_677470.jpg'
                    },
                    {
                        id: 6,
                        title: 'Солянка м\'ясна',
                        price: 175,
                        category: 'soup',
                        desc: 'Густий суп із асорті копчених м\'ясних виробів, маринованими огірками та оливками.',
                        isAvailable: true,
                        img_url: 'https://city-izyum.pp.ua/wp-content/uploads/2021/10/82a36c14dc3c96eacd272b0aacecde56.jpg'
                    },
                    {
                        id: 7,
                        title: 'Лагман узбецький',
                        price: 170,
                        category: 'soup',
                        desc: 'Наваристий суп із баранини з домашньою локшиною та овочами.',
                        isAvailable: true,
                        img_url: 'https://i.ytimg.com/vi/xTiPi63NalA/sddefault.jpg'
                    },
                    {
                        id: 8,
                        title: 'Крем-суп із гарбуза',
                        price: 130,
                        category: 'soup',
                        desc: 'Оксамитовий суп-пюре з імбирем, кокосовим молоком та насінням гарбуза.',
                        isAvailable: true,
                        img_url: 'https://otvalentiny.od.ua/upload/image/html_set/6707876422492.jpg'
                    },
                    {
                        id: 9,
                        title: 'Журек польський',
                        price: 155,
                        category: 'soup',
                        desc: 'Кислий житній суп із ковбаскою, яйцем та хріном.',
                        isAvailable: true,
                        img_url: 'https://tvojarabota.pl/img/1200/080261e4427a081fc6e637b654f590ee.jpg'
                    },
                    {
                        id: 10,
                        title: 'Мінестроне овочеве',
                        price: 135,
                        category: 'soup',
                        desc: 'Італійський суп із сезонними овочами, пастою та пармезаном.',
                        isAvailable: true,
                        img_url: 'http://easy-cooking.com.ua/wp-content/uploads/2016/08/DSC00931-e1472295051375.jpg'
                    },
                    {
                        id: 11,
                        title: 'Куряча локшина домашня',
                        price: 145,
                        category: 'soup',
                        desc: 'Прозорий курячий бульйон із яєчною локшиною та зеленню.',
                        isAvailable: true,
                        img_url: 'https://i.ytimg.com/vi/KEQGVKBOv7U/maxresdefault.jpg'
                    },
                    {
                        id: 12,
                        title: 'Французький цибульний суп',
                        price: 160,
                        category: 'soup',
                        desc: 'Карамелізована цибуля, яловичий бульйон, грінка з грюєром.',
                        isAvailable: true,
                        img_url: 'https://klopotenko.com/wp-content/uploads/2018/03/tsybulnyy-sup_sitewebukr-1000x600.jpg?v=1624979301'
                    },
                    {
                        id: 13,
                        title: 'Стейк Рібай з печеною картоплею',
                        price: 420,
                        category: 'meat',
                        desc: 'Преміальна яловичина прожарки Medium, подається з соусом BBQ.',
                        isAvailable: true,
                        img_url: 'https://i.ytimg.com/vi/nnGWsGVX760/maxresdefault.jpg'
                    },
                    {
                        id: 14,
                        title: 'Свинячі реберця BBQ',
                        price: 380,
                        category: 'meat',
                        desc: 'Томлені 6 годин реберця у фірмовому соусі BBQ, подаються з кукурудзою.',
                        isAvailable: true,
                        img_url: 'https://www.enders.com.ua/image/catalog/shutterstock_611174102_2.jpg'
                    },
                    {
                        id: 15,
                        title: 'Телятина Оссобуко',
                        price: 395,
                        category: 'meat',
                        desc: 'Тушкована теляча гомілка по-міланськи з гремолатою та різото.',
                        isAvailable: true,
                        img_url: 'https://grill-bbq.ru/wp-content/uploads/2023/03/ossobuko-800x600-1.jpg'
                    },
                    {
                        id: 16,
                        title: 'Котлета по-київськи',
                        price: 265,
                        category: 'meat',
                        desc: 'Соковита куряча котлета з вершковим маслом у хрусткій паніровці.',
                        isAvailable: true,
                        img_url: 'https://rud.ua/uploads/under_recipe/02_600x300_5f686cb1bd6ca.jpg'
                    },
                    {
                        id: 17,
                        title: 'Шашлик з баранини',
                        price: 340,
                        category: 'meat',
                        desc: 'Маринована в зелені та спеціях баранина на мангалі з цибулею.',
                        isAvailable: true,
                        img_url: 'https://i.obozrevatel.com/food/recipemain/2019/1/8/1136.jpg?size=636x424'
                    },
                    {
                        id: 18,
                        title: 'Качина грудка з вишнею',
                        price: 360,
                        category: 'meat',
                        desc: 'Качина грудка прожарки Medium зі кислувато-солодким вишневим соусом.',
                        isAvailable: true,
                        img_url: 'https://klopotenko.com/wp-content/uploads/2023/04/kachyni-hrudky-v-sousi-z-kahoru-img-1000x600.jpg?v=1720545071'
                    },
                    {
                        id: 19,
                        title: 'Стейк Нью-Йорк',
                        price: 445,
                        category: 'meat',
                        desc: 'Яловичий стрип-стейк на кістці з трюфельним маслом та спаржею.',
                        isAvailable: true,
                        img_url: 'https://www.steakhome.ru/upload/iblock/a6f/a6fc538f39d05e73b3985723f33e0784.jpg'
                    },
                    {
                        id: 20,
                        title: 'Свиняча шия на грилі',
                        price: 295,
                        category: 'meat',
                        desc: 'Соковита свинина на грилі з гірчично-медовим маринадом.',
                        isAvailable: true,
                        img_url: 'https://i.ytimg.com/vi/B7uPxUJh9_Q/maxresdefault.jpg'
                    },
                    {
                        id: 21,
                        title: 'Курча тапака',
                        price: 275,
                        category: 'meat',
                        desc: 'Куряча тушка під пресом на сковороді зі спеціями та часниковим соусом.',
                        isAvailable: true,
                        img_url: 'https://picantecooking.com/pictures/2017-05/kurcha-tabaka-tsitsila-tabaka-6404d681d472a755795067.jpg'
                    },
                    {
                        id: 22,
                        title: 'Пекінська качка (половина)',
                        price: 890,
                        category: 'meat',
                        desc: 'Класична пекінська качка з млинчиками, соусом Хойсін та огірком.',
                        isAvailable: true,
                        img_url: 'https://myasnuyray.com.ua/wp-content/uploads/2018/08/2-7.jpg'
                    },
                    {
                        id: 23,
                        title: 'Бургер Смоукі',
                        price: 235,
                        category: 'meat',
                        desc: 'Соковита котлета із яловичини, копчений чеддер, хрустка цибуля, соус BBQ.',
                        isAvailable: true,
                        img_url: 'https://api-v3.fuji.ru/_ipx/f_webp,q_100,s_500x500/uploads/shop/full/96ed2928-9402-407e-a737-180b35a4b775.png'
                    },
                    {
                        id: 24,
                        title: 'Стейк Флет Айрон',
                        price: 310,
                        category: 'meat',
                        desc: 'Маринований стейк із лопатки з печеними томатами та зеленою сальсою.',
                        isAvailable: true,
                        img_url: 'http://primebeef.ru/images/cms/data/cuts/big/flat-iron-steak-114v-pso4.png'
                    },
                    {
                        id: 25,
                        title: 'Курячі крильця у медово-часниковому соусі',
                        price: 195,
                        category: 'meat',
                        desc: 'Хрусткі крильця, карамелізовані в медово-часниковому маринаді.',
                        isAvailable: true,
                        img_url: 'https://ua.yabpoela.net/uploads/posts/2026-02/kurinye-goleni-v-medovo-chesnochnom-souse.webp'
                    },
                    {
                        id: 26,
                        title: 'Телячі медальйони з трюфелем',
                        price: 465,
                        category: 'meat',
                        desc: 'Ніжна телятина на вершковому соусі з чорним трюфелем.',
                        isAvailable: true,
                        img_url: 'https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3740211801968387768'
                    },
                    {
                        id: 27,
                        title: 'Пулькогі (корейська яловичина)',
                        price: 295,
                        category: 'meat',
                        desc: 'Маринована тонко нарізана яловичина на грилі з кунжутом і зеленою цибулею.',
                        isAvailable: false,
                        img_url: 'https://shuba.life/static/content/thumbs/1200x630/1/38/k2z3qs---c40x21x50px50p-up--42137686cb10bba700f1a7634b297381.jpg'
                    },
                    {
                        id: 28,
                        title: 'Філе лосося на грилі',
                        price: 335,
                        category: 'fish',
                        desc: 'Стейк норвезького лосося з соусом тартар та овочами гриль.',
                        isAvailable: true,
                        img_url: 'https://whogrill.ru/upload/resize_cache/webp/iblock/e71/e7112443113d2733c24f5ff9db55f465.webp'
                    },
                    {
                        id: 29,
                        title: 'Морський окунь у солі',
                        price: 380,
                        category: 'fish',
                        desc: 'Ціла риба, запечена в соляній скоринці, з лимонно-капарним соусом.',
                        isAvailable: true,
                        img_url: 'http://recipes.egersund.ua/images/whole-fish-baked-in-salt-crust-main.jpg'
                    },
                    {
                        id: 30,
                        title: 'Креветки у вершково-часниковому соусі',
                        price: 285,
                        category: 'fish',
                        desc: 'Тигрові креветки в ароматному вершковому соусі з чилі та петрушкою.',
                        isAvailable: true,
                        img_url: 'https://guslyanka.com/wp-content/uploads/2023/04/Krevetky-v-vershkovo-chasnykovomu-sousi-11.jpg'
                    },
                    {
                        id: 31,
                        title: 'Кальмар фарширований',
                        price: 245,
                        category: 'fish',
                        desc: 'Тушка кальмара, фарширована рисом, овочами та морепродуктами.',
                        isAvailable: true,
                        img_url: 'https://www.russianfood.com/dycontent/images_upl/307/big_306328.jpg'
                    },
                    {
                        id: 32,
                        title: 'Мідії в томатному соусі',
                        price: 220,
                        category: 'fish',
                        desc: 'Свіжі мідії у пряному томатному соусі з білим вином та базиліком.',
                        isAvailable: true,
                        img_url: 'https://shuba.life/static/content/thumbs/1824x912/a/66/kzaorw---c2x1x50px50p-up--5842f428dfa37d7a30bb688d191e866a.jpg'
                    },
                    {
                        id: 33,
                        title: 'Тунець Татакі',
                        price: 310,
                        category: 'fish',
                        desc: 'Злегка обсмажений стейк тунця з соусом Понзу та авокадо.',
                        isAvailable: true,
                        img_url: 'https://img.iamcook.ru/2024/upl/recipes/zen/u-f609ec9a45a36f21539c0f699fd4e3e3.jpg'
                    },
                    {
                        id: 34,
                        title: 'Риба у клярі (Fish & Chips)',
                        price: 265,
                        category: 'fish',
                        desc: 'Тріска у хрусткому пивному клярі з картоплею фрі та соусом тартар.',
                        isAvailable: true,
                        img_url: 'https://i.ytimg.com/vi/3I5LjSHBInk/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGHIgXig6MA8=&rs=AOn4CLCGuyEHI29S60S_Ivyp-dcvYn5jBw'
                    },
                    {
                        id: 35,
                        title: 'Осьминіг на грилі',
                        price: 395,
                        category: 'fish',
                        desc: 'Тендеризований осьминіг зі смаженим нутом, паприкою та лимонним маслом.',
                        isAvailable: true,
                        img_url: 'https://www.tablycjakalorijnosti.com.ua/file/image/foodstuff/927bacedb4ac3123/820703e5a907418a9b4770097d946dd4'
                    },
                    {
                        id: 36,
                        title: 'Сібас на пару з імбиром',
                        price: 355,
                        category: 'fish',
                        desc: 'Ціла риба на пару з соєвим соусом, імбиром та кунжутною олією.',
                        isAvailable: true,
                        img_url: 'https://picantecooking.com/media/cache/content_detail_preview/pictures/2017-03/zapecheniy-sibas-z-imbirno-limonnim-aromatom-6404d50d78872183576532.jpg'
                    },
                    {
                        id: 37,
                        title: 'Гребінці з горохово-м\'ятним пюре',
                        price: 420,
                        category: 'fish',
                        desc: 'Обсмажені морські гребінці з кремовим пюре та хрустким прошуто.',
                        isAvailable: true,
                        img_url: 'https://shuba.life/static/content/thumbs/1200x630/6/00/anrujk---c1200x630x50px50p-up--bb26e455aa7f0bbe8e229641f2c8c006.jpg'
                    },
                    {
                        id: 38,
                        title: 'Салат Цезар з куркою су-від',
                        price: 195,
                        category: 'salad',
                        desc: 'Мікс салатів, соковита курка, грінки, пармезан та фірмовий соус.',
                        isAvailable: true,
                        img_url: 'https://yapiko.ua/media/catalog/product/cache/90c631851bfc82ed3538a672fa9488bb/c/a/caesar_salad_with_chicken_su-vid_updated_photos.png'
                    },
                    {
                        id: 39,
                        title: 'Грецький салат',
                        price: 155,
                        category: 'salad',
                        desc: 'Томати, огірок, оливки Каламата, фета, червона цибуля, орегано.',
                        isAvailable: true,
                        img_url: 'https://picantecooking.com/pictures/2015-07/miy-gretskiy-salat-6404cfe71b06f166198788.jpg'
                    },
                    {
                        id: 40,
                        title: 'Нісуаз',
                        price: 210,
                        category: 'salad',
                        desc: 'Тунець, яйця, стручкова квасоля, анчоуси, оливки, вінегрет.',
                        isAvailable: true,
                        img_url: 'https://klopotenko.com/wp-content/uploads/2021/05/salat-nisuaz_sitewebukr-1000x600.jpg'
                    },
                    {
                        id: 41,
                        title: 'Теплий салат із качиним конфі',
                        price: 245,
                        category: 'salad',
                        desc: 'Рваний качиний конфі, мікс зелені, груша, горіхи пекан, бальзамік.',
                        isAvailable: true,
                        img_url: 'https://www.tiktok.com/api/img/?itemId=7580663872730746123&location=0&aid=1988'
                    },
                    {
                        id: 42,
                        title: 'Капрезе з моцарелою буфала',
                        price: 185,
                        category: 'salad',
                        desc: 'Свіжі томати, моцарела буфала, базилік, оливкова олія екстра вірджин.',
                        isAvailable: true,
                        img_url: 'https://ivona.ua/i/52/92/84/5/5292845/53870779815cca2446224e8f986d0aeb-resize_crop_1Xquality_100Xallow_enlarge_0Xw_1200Xh_630.jpg'
                    },
                    {
                        id: 43,
                        title: 'Салат із буряком та козячим сиром',
                        price: 175,
                        category: 'salad',
                        desc: 'Печений буряк, козячим сир, руккола, волоський горіх та медовий дресинг.',
                        isAvailable: true,
                        img_url: 'https://kylinaria.prostoway.com/wp-content/uploads/2024/11/1-2024-11-22T091729.381.png'
                    },
                    {
                        id: 44,
                        title: 'Тайський салат із яловичиною',
                        price: 235,
                        category: 'salad',
                        desc: 'Тонко нарізана яловичина гриль, рисова локшина, м\'ята, кінза, соус Nam Jim.',
                        isAvailable: true,
                        img_url: 'https://picantecooking.com/pictures/2021-01/thai-steak-salad-06-64052ad1cb1a8024106448.jpg'
                    },
                    {
                        id: 45,
                        title: 'Фреш-боул із кіноа та авокадо',
                        price: 195,
                        category: 'salad',
                        desc: 'Кіноа, авокадо, едамаме, огірок, морква, заправка тахіні-лимон.',
                        isAvailable: true,
                        img_url: 'https://www.tiktok.com/api/img/?itemId=7486586966306295045&location=0&aid=1988'
                    },
                    {
                        id: 46,
                        title: 'Теплий салат із лососем',
                        price: 255,
                        category: 'salad',
                        desc: 'Смужки лосося гриль на шпинаті, каперси, солодка цибуля, лимонний дресинг.',
                        isAvailable: true,
                        img_url: 'https://beerclub10.if.ua/wp-content/uploads/2024/11/%D0%A2%D0%B5%D0%BF%D0%BB%D0%B8%D0%B9-%D0%B7-%D0%9B%D0%BE%D1%81%D0%BE%D1%81%D0%B5%D0%BC-scaled-1.jpg'
                    },
                    {
                        id: 47,
                        title: 'Вальдорф',
                        price: 170,
                        category: 'salad',
                        desc: 'Яблуко, селера, волоські горіхи, виноград, курка, creмова заправка.',
                        isAvailable: true,
                        img_url: 'https://gurmel.ru/wp-content/uploads/2018/01/1215.jpg'
                    },
                    {
                        id: 48,
                        title: 'Спагетті Карбонара',
                        price: 215,
                        category: 'pasta',
                        desc: 'Класична римська паста з гуанчале, яйцями та пекоріно романо.',
                        isAvailable: true,
                        img_url: 'https://s1.eda.ru/StaticContent/Photos/Upscaled/120213175134/1202131752241/p_O.jpg'
                    },
                    {
                        id: 49,
                        title: 'Тальятелле з трюфелем',
                        price: 345,
                        category: 'pasta',
                        desc: 'Свіжа яєчна паста з вершковим соусом і стружкою чорного трюфеля.',
                        isAvailable: true,
                        img_url: 'https://www.uavgusta.net/upload/iblock/a09/gts2lytemrkt7fp94d3kj4j0fnf1vhy1/talyatelle_s_tryufelem.jpg'
                    },
                    {
                        id: 50,
                        title: 'Ризото з морепродуктами',
                        price: 295,
                        category: 'pasta',
                        desc: 'Кремове ризото Арборіо з кальмарами, мідіями та креветками.',
                        isAvailable: true,
                        img_url: 'https://kupi-rakushku.od.ua/upload/image/html_set/rizotto-s-moreproduktami3.jpeg'
                    },
                    {
                        id: 51,
                        title: 'Пенне Аррабіята',
                        price: 185,
                        category: 'pasta',
                        desc: 'Паста в гострому томатному соусі з часником та базиліком.',
                        isAvailable: true,
                        img_url: 'https://www.uavgusta.net/upload/iblock/74b/12ot7ir9k6ny4ou3u145ly2ngeypjmy1/penne_s_pikantnym_sousom_arrabbyata.jpg'
                    },
                    {
                        id: 52,
                        title: 'Лазанья болоньєзе',
                        price: 245,
                        category: 'pasta',
                        desc: 'Класична лазанья з м\'ясним рагу та соусом бешамель.',
                        isAvailable: true,
                        img_url: 'https://barilla.ru/wp-content/uploads/2023/12/lazanja-boloneze-min_11zon-e1745418958338-1200x900.webp'
                    },
                    {
                        id: 53,
                        title: 'Ризото з грибами та трюфельним маслом',
                        price: 265,
                        category: 'pasta',
                        desc: 'Кремове ризото з лісовими грибами та ароматним трюфельним маслом.',
                        isAvailable: true,
                        img_url: 'https://s1.eda.ru/StaticContent/Photos/120214154125/181023075701/p_O.jpg'
                    },
                    {
                        id: 54,
                        title: 'Паста Примавера',
                        price: 195,
                        category: 'pasta',
                        desc: 'Свіжа паста зі спаржею, горошком, цукіні та лимонно-вершковим соусом.',
                        isAvailable: true,
                        img_url: 'https://static01.nyt.com/images/2024/06/27/multimedia/DP-Pasta-Primaverarex-jklh/DP-Pasta-Primaverarex-jklh-mediumSquareAt3X.jpg'
                    },
                    {
                        id: 55,
                        title: 'Равіолі з рикотою та шпинатом',
                        price: 235,
                        category: 'pasta',
                        desc: 'Домашні равіолі в соусі Буро-саво з пармезаном.',
                        isAvailable: true,
                        img_url: 'https://molokoferma.com.ua/wp-content/uploads/2021/11/ravyoly-ryk-shpynat.jpg'
                    },
                    {
                        id: 56,
                        title: 'Гречана каша із смаженою цибулею',
                        price: 85,
                        category: 'pasta',
                        desc: 'Розсипчаста гречка з хрустким цибулевим зажарюванням та маслом.',
                        isAvailable: true,
                        img_url: 'https://sushka.com.ua/image/cache/catalog/porridge/grechana-kasha-z-lukom/kasha-grechana-z-lukom_sushka-max-1000.webp'
                    },
                    {
                        id: 57,
                        title: 'Полента з грибним рагу',
                        price: 175,
                        category: 'pasta',
                        desc: 'Вершкова полента з тосканським рагу з лісових грибів.',
                        isAvailable: true,
                        img_url: 'https://e0.edimdoma.ru/data/recipes/0014/2295/142295-ed4_wide.jpg?1759223294'
                    },
                    {
                        id: 58,
                        title: 'Піца Маргарита',
                        price: 185,
                        category: 'pizza',
                        desc: 'Томатний соус, моцарела фіор ді лате, свіжий базилік, оливкова олія.',
                        isAvailable: true,
                        img_url: 'https://klopotenko.com/wp-content/uploads/2023/03/pitsa-marharyta_sitewebukr-img-1000x600.jpg?v=1720545473'
                    },
                    {
                        id: 59,
                        title: 'Піца Пепероні',
                        price: 215,
                        category: 'pizza',
                        desc: 'Томатний соус, моцарела, гострий салямі пепероні.',
                        isAvailable: true,
                        img_url: 'https://cipollino.ua/content/uploads/images/pytstsa-pepperony-sostav-retsept-y-kaloryinost-1-cipollino.jpg'
                    },
                    {
                        id: 60,
                        title: 'Піца Бьянка з трюфелем',
                        price: 285,
                        category: 'pizza',
                        desc: 'Вершковий соус, моцарела, parkмезан, рукола, стружка трюфеля.',
                        isAvailable: true,
                        img_url: 'https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3761950743889210608'
                    },
                    {
                        id: 61,
                        title: 'Піца Чотири сири',
                        price: 235,
                        category: 'pizza',
                        desc: 'Моцарела, горгонзола, пармезан, рікота, мед при подачі.',
                        isAvailable: true,
                        img_url: 'https://shuba.life/static/content/thumbs/1824x912/9/72/vgpksj---c2x1x50px50p-up--a0cfd1b2207fa1e59345530c47d24729.jpg'
                    },
                    {
                        id: 62,
                        title: 'Піца з морепродуктами',
                        price: 265,
                        category: 'pizza',
                        desc: 'Томатний соус, моцарела, мідії, креветки, кальмари, оливки.',
                        isAvailable: true,
                        img_url: 'https://retsepty.co.ua/wp-content/uploads/2025/04/Pitsa-z-moreproduktamy.jpg'
                    },
                    {
                        id: 63,
                        title: 'Піца Прошуто е Фунгі',
                        price: 240,
                        category: 'pizza',
                        desc: 'Томатний соус, моцарела, пармська шинка, гриби, базилік.',
                        isAvailable: true,
                        img_url: 'https://assets.dots.live/misteram-public/0188862b-fd0a-7045-b9f6-e4670e58f19a.png'
                    },
                    {
                        id: 64,
                        title: 'Піца Кальцоне',
                        price: 225,
                        category: 'pizza',
                        desc: 'Закрита піца з рикотою, ковбасою, шпинатом та томатним соусом.',
                        isAvailable: true,
                        img_url: 'https://klopotenko.com/wp-content/uploads/2025/01/kal%CA%B9tsone-img-1000x600.jpg?v=1738322197'
                    },
                    {
                        id: 65,
                        title: 'Брускета з томатами та базиліком',
                        price: 95,
                        category: 'snack',
                        desc: 'Підсмажений чіабата, томати конкасе, часник, оливкова олія.',
                        isAvailable: true,
                        img_url: 'https://img2.zakaz.ua/upload.version_1.0.da0987a54c2454788b4bb3b78c143de3.350x350.jpeg'
                    },
                    {
                        id: 66,
                        title: 'Карпаччо з яловичини',
                        price: 235,
                        category: 'snack',
                        desc: 'Тонко нарізана сира яловичина з рукколою, пармезаном та каперсами.',
                        isAvailable: true,
                        img_url: 'https://www.sveganas.com/wp-content/uploads/2024/04/marble-beef-carpaccio-min.jpg'
                    },
                    {
                        id: 67,
                        title: 'Тартар із лосося',
                        price: 260,
                        category: 'snack',
                        desc: 'Свіжий лосось, авокадо, каперси, шалот, лимонний дресинг.',
                        isAvailable: true,
                        img_url: 'https://klopotenko.com/wp-content/uploads/2024/03/tartar-z-lososya-img-1000x600.jpg?v=1720541153'
                    },
                    {
                        id: 68,
                        title: 'Хумус із піта-хлібом',
                        price: 115,
                        category: 'snack',
                        desc: 'Класичний хумус із нутом, тахіні, оливковою олією та паприкою.',
                        isAvailable: true,
                        img_url: 'https://cdn.prod.website-files.com/65ba47acaa465c7bfee66273/66e2f89425fdf6c84820a352_%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202024-09-12%20%D0%B2%2016.19.52.webp'
                    },
                    {
                        id: 69,
                        title: 'Сирна тарілка (5 видів)',
                        price: 385,
                        category: 'snack',
                        desc: 'Камамбер, горгонзола, манчего, грюєр, чеддер із медом і горіхами.',
                        isAvailable: true,
                        img_url: 'https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=3092640967456919'
                    },
                    {
                        id: 70,
                        title: 'М\'ясна тарілка',
                        price: 420,
                        category: 'snack',
                        desc: 'Прошуто, коппа, брезаола, фюе, паштет, корнішони та гірчиця.',
                        isAvailable: true,
                        img_url: 'https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=2904598252678608866'
                    },
                    {
                        id: 71,
                        title: 'Начос із гуакамоле',
                        price: 145,
                        category: 'snack',
                        desc: 'Хрусткі кукурудзяні чіпси з авокадо, сальсою та сметаною.',
                        isAvailable: true,
                        img_url: 'https://www.delicados.ru/images/recipes/catalog/nachos-s-guakomple.jpg'
                    },
                    {
                        id: 72,
                        title: 'Смажені кільця кальмара',
                        price: 175,
                        category: 'snack',
                        desc: 'Хрусткі кільця кальмара в паніровці з соусом аїолі.',
                        isAvailable: true,
                        img_url: 'https://images.unian.net/photos/2025_04/thumb_files/1200_0_1745658180-5331.jpg'
                    },
                    {
                        id: 73,
                        title: 'Фалафель з соусом тахіні',
                        price: 125,
                        category: 'snack',
                        desc: 'Хрусткі нутові кульки з травами, подаються з кремом тахіні та пітою.',
                        isAvailable: true,
                        img_url: 'https://ninja-kitchen.com.ua/image/cache/catalog/recepty/grills/af500/bn495/bn650/02-500x500.jpg'
                    },
                    {
                        id: 74,
                        title: 'Едамаме з морською сіллю',
                        price: 85,
                        category: 'snack',
                        desc: 'Стручки молодої сої, відварені та посолені морською сіллю.',
                        isAvailable: true,
                        img_url: 'https://sereda.website/storage/share/2137/conversions/c462cd41-edba-4013-a92b-1d6e2c557451-thumb.webp'
                    },
                    {
                        id: 75,
                        title: 'Вонтони смажені',
                        price: 135,
                        category: 'snack',
                        desc: 'Хрусткі китайські вареники з свинячим фаршем та соусом чилі.',
                        isAvailable: true,
                        img_url: 'https://kuhari.com.ua/img/jarenie_vontoni_po-meksikanski-42372.webp'
                    },
                    {
                        id: 76,
                        title: 'Тапас — оливки марінара',
                        price: 90,
                        category: 'snack',
                        desc: 'Мікс оливок у маринаді з апельсиновою цедрою, чилі та тим\'яном.',
                        isAvailable: true,
                        img_url: 'https://landshaft.info/15741-thickbox_default/chamaecyparis-obtusa-maureen.jpg'
                    },
                    {
                        id: 77,
                        title: 'Гриль-овочі з сиром фета',
                        price: 155,
                        category: 'vegan',
                        desc: 'Цукіні, баклажан, болгарський перець, кабачок, фета та базилік.',
                        isAvailable: true,
                        img_url: 'https://tereveni.com.ua/wp-content/uploads/2023/05/ovochi-gryl-z-syrom-feta3.jpg'
                    },
                    {
                        id: 78,
                        title: 'Карі з нутом та шпинатом',
                        price: 165,
                        category: 'vegan',
                        desc: 'Індійське карі з нутом, шпинатом, кокосовим молоком та рисом басматі.',
                        isAvailable: true,
                        img_url: 'https://dash-market.com.ua/image/catalog/blog/karri-kokos-nut-i-proczeee.jpg'
                    },
                    {
                        id: 79,
                        title: 'Буддa-боул',
                        price: 180,
                        category: 'vegan',
                        desc: 'Кіноа, печений гарбуз, авокадо, брокколі, нут, заправка місо-тахіні.',
                        isAvailable: true,
                        img_url: 'https://img.povar.ru/mobile/ce/8f/fd/67/budda_boul-564883.jpeg'
                    },
                    {
                        id: 80,
                        title: 'Баклажан Пармеджана',
                        price: 170,
                        category: 'vegan',
                        desc: 'Шари смаженого баклажана, томатного соусу та розплавленої моцарели.',
                        isAvailable: true,
                        img_url: 'https://eda.rambler.ru/images/RecipePhoto/1280x1280/vkusneyshiy-baklazhan-parmidzhano_151292_photo_157880.jpg'
                    },
                    {
                        id: 81,
                        title: 'Паста Пріма Вера (vegan)',
                        price: 175,
                        category: 'vegan',
                        desc: 'Паста зі сезонними овочами у томатно-оливковому соусі без сиру.',
                        isAvailable: true,
                        img_url: 'https://www.veggieinspired.com/wp-content/uploads/2023/01/vegan-pasta-primavera-hero.jpg'
                    },
                    {
                        id: 82,
                        title: 'Веган-бургер із чорною квасолею',
                        price: 215,
                        category: 'vegan',
                        desc: 'Соковита котлета з квасолі та буряка, авокадо, хрустка цибуля, соус чилі.',
                        isAvailable: true,
                        img_url: 'https://organni.com/wp-content/uploads/veggie-burger.jpg.webp'
                    },
                    {
                        id: 83,
                        title: 'Тофу у теріякі',
                        price: 165,
                        category: 'vegan',
                        desc: 'Обсмажений tofu в соусі теріякі з рисом та броколі.',
                        isAvailable: true,
                        img_url: 'https://img.povar.ru/mobile/1e/6a/55/2c/tofu-teriyaki-804900.jpg'
                    },
                    {
                        id: 84,
                        title: 'Лаваш з хумусом та овочами гриль',
                        price: 145,
                        category: 'vegan',
                        desc: 'Тонкий лаваш, хумус, перець, цукіні, шпинат, соус цацікі.',
                        isAvailable: true,
                        img_url: 'https://www.tiktok.com/api/img/?itemId=7641266586631834901&location=0&aid=1988'
                    },
                    {
                        id: 85,
                        title: 'Курячі нагетси з картопотею фрі',
                        price: 115,
                        category: 'kids',
                        desc: 'Хрусткі нагетси з куриці з картоплею фрі та кетчупом.',
                        isAvailable: true,
                        img_url: 'https://noa.ua/wp-content/uploads/2024/09/kuryachi-nagetsy-ta-kartoplya-fri.jpg'
                    },
                    {
                        id: 86,
                        title: 'Паста Болоньєзе мала',
                        price: 125,
                        category: 'kids',
                        desc: 'Дитяча порція пасти зі м\'ясним соусом болоньєзе.',
                        isAvailable: true,
                        img_url: 'https://i.ytimg.com/vi/kKrfhdFtXKE/maxresdefault.jpg'
                    },
                    {
                        id: 87,
                        title: 'Млинці з варенням',
                        price: 95,
                        category: 'kids',
                        desc: 'Тоненькі млинці з полуничним варенням та сметаною.',
                        isAvailable: true,
                        img_url: 'https://patelnya.com.ua/wp-content/uploads/2013/05/mlyntsi_z_syrom_ta_varennyam.jpg'
                    },
                    {
                        id: 88,
                        title: 'Сирники зі сметаною',
                        price: 105,
                        category: 'kids',
                        desc: 'Пухкі сирники з натуральним сиром, подаються з густою сметаною.',
                        isAvailable: true,
                        img_url: 'https://i.obozrevatel.com/food/recipemain/2019/6/11/caption.jpg?size=636x424'
                    },
                    {
                        id: 89,
                        title: 'Піца дитяча Маргарита (маленька)',
                        price: 135,
                        category: 'kids',
                        desc: 'Невеличка піца з томатним соусом та моцарелою.',
                        isAvailable: true,
                        img_url: 'https://fishkifood.com.ua/upload/resize_cache/webp/iblock/012/450_450_1/012ab2a66517aca1558cbbb9a5d1cb80.webp'
                    },
                    {
                        id: 90,
                        title: 'Тірамісу класичний',
                        price: 155,
                        category: 'dessert',
                        desc: 'Ніжний італійський десерт із савоярді, маскарпоне та еспресо.',
                        isAvailable: true,
                        img_url: 'https://lasunka.com/s165-prew.jpg'
                    },
                    {
                        id: 91,
                        title: 'Чізкейк Нью-Йорк',
                        price: 145,
                        category: 'dessert',
                        desc: 'Кремовий чізкейк на пісочній основі з полуничним кулі.',
                        isAvailable: true,
                        img_url: 'https://art-lunch.ru/content/uploads/2014/08/cheesecake-new-york-001x2-1.jpg'
                    },
                    {
                        id: 92,
                        title: 'Шоколадний фондан',
                        price: 165,
                        category: 'dessert',
                        desc: 'Теплий шоколадний кекс із рідкою серединкою та кулею морозива.',
                        isAvailable: true,
                        img_url: 'https://art-lunch.ru/content/uploads/2013/08/chocolate_fondant_01.jpg'
                    },
                    {
                        id: 93,
                        title: 'Панна Котта з манго',
                        price: 135,
                        category: 'dessert',
                        desc: 'Ніжня вершкова желе з тропічним манговим кулі.',
                        isAvailable: true,
                        img_url: 'https://vkusvill.ru/upload/resize/482951/panna-kotta-s-mango-i-malinoy_588x409x90_c.webp'
                    },
                    {
                        id: 94,
                        title: 'Павлова з ягодами',
                        price: 155,
                        category: 'dessert',
                        desc: 'Хрустке безе, збиті вершки, свіжа полуниця та чорниця.',
                        isAvailable: true,
                        img_url: 'https://static.vkusnyblog.com/full/uploads/2013/07/pavlova-s-yagodami.jpg'
                    },
                    {
                        id: 95,
                        title: 'Профітролі з шоколадом',
                        price: 140,
                        category: 'dessert',
                        desc: 'Тістечка-шу з ванільним крем під гарячим шоколадним соусом.',
                        isAvailable: true,
                        img_url: 'https://images.prom.ua/3010302796_w1280_h640_profitroli-s-shokoladom.jpg'
                    },
                    {
                        id: 96,
                        title: 'Крем-брюле ванільний',
                        price: 145,
                        category: 'dessert',
                        desc: 'Класичний французький десерт із карамелізованою цукровою скоринкою.',
                        isAvailable: true,
                        img_url: 'https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3790947177405893732'
                    },
                    {
                        id: 97,
                        title: 'Медовик домашній',
                        price: 135,
                        category: 'dessert',
                        desc: 'Тортик із медових коржів із ніжним сметанним кремом.',
                        isAvailable: true,
                        img_url: 'https://i.ytimg.com/vi/0-iLjpWBgFg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDy5QOtz8C_puadXS_87VQtu4qbyA'
                    },
                    {
                        id: 98,
                        title: 'Морозиво (3 кулі)',
                        price: 95,
                        category: 'dessert',
                        desc: 'Вибір 3-х смаків: ваніль, шоколад, малина, фісташки, карамель.',
                        isAvailable: true,
                        img_url: 'https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3371217302844716427'
                    },
                    {
                        id: 99,
                        title: 'Еклери шоколадні',
                        price: 120,
                        category: 'dessert',
                        desc: 'Класичні еклери із шоколадним кремом та помадкою.',
                        isAvailable: true,
                        img_url: 'https://klymovska.com/wp-content/uploads/2023/06/chocolate-eclairs.jpg'
                    },
                    {
                        id: 100,
                        title: 'Сорбет лимонний',
                        price: 85,
                        category: 'dessert',
                        desc: 'Освіжаючий лимонний сорбет, поданий у цілому лимоні.',
                        isAvailable: true,
                        img_url: 'https://klopotenko.com/wp-content/uploads/2024/06/lymonniy-sorbet-img-1000x600.jpg?v=1720540273'
                    },
                    {
                        id: 101,
                        title: 'Домашній лимонад Імбир-Цитрус',
                        price: 75,
                        category: 'drinks',
                        desc: 'Освіжаючий напій власного приготування з натуральним імбиром.',
                        isAvailable: true,
                        img_url: 'https://ua.yabpoela.net/uploads/posts/2020-11/1606312079_img_20201122_145039.jpg'
                    },
                    {
                        id: 102,
                        title: 'Мохіто безалкогольний',
                        price: 85,
                        category: 'drinks',
                        desc: 'М\'ята, лайм, цукор, содова — класичний без алкоголю.',
                        isAvailable: true,
                        img_url: 'https://ua.inshaker.com/uploads/cocktail/hires/679/1557242757-Mojito'
                    },
                    {
                        id: 103,
                        title: "Фреш апельсиновий",
                        price: 70,
                        category: "drinks",
                        desc: "Свіжовичавлений сік із 4 апельсинів.",
                        isAvailable: true,
                        img_url: "https://shuba.life/static/content/thumbs/1200x630/8/71/wwppvh---c2000x1050x0sx282s-up--a33f6e7440547f23e5404a750c59c718.jpg"
                    },
                    {
                        id: 104,
                        title: "Смузі Тропік",
                        price: 110,
                        category: "drinks",
                        desc: "Манго, ананас, банан, кокосове молоко.",
                        isAvailable: true,
                        img_url: "https://mywatershop.com.ua/upload/iblock/545/bs_puree_120g_tropic.png"
                    },
                    {
                        id: 105,
                        title: "Смузі ягідний",
                        price: 105,
                        category: "drinks",
                        desc: "Полуниця, малина, чорниця, йогурт.",
                        isAvailable: true,
                        img_url: "https://homeidealist.gorenje.ua/wp-content/uploads/2016/03/shutterstock_304253153.jpg"
                    },
                    {
                        id: 106,
                        title: "Айс-латте",
                        price: 80,
                        category: "drinks",
                        desc: "Подвійний еспресо, молоко, лід. Подається у великому склянці.",
                        isAvailable: true,
                        img_url: "https://vkusvill.ru/upload/resize/335446/ays-latte_588x409x90_c.webp"
                    },
                    {
                        id: 107,
                        title: "Матча латте",
                        price: 90,
                        category: "drinks",
                        desc: "Японський зелений чай матча з вівсяним молоком.",
                        isAvailable: true,
                        img_url: "https://korshop.ru/upload/medialibrary/2c2/2c2d4a23293ad9fedaa0bd4dd6e03e0e.jpg"
                    },
                    {
                        id: 108,
                        title: "Лимонад Маракуйя-Маліна",
                        price: 80,
                        category: "drinks",
                        desc: "Освіжаюча суміш маракуї та малини на газованій воді.",
                        isAvailable: true,
                        img_url: "https://jz9czo0xs6.ru.scalesta-cdn.com/R8vFfBZ9c_lEz9XYq9lq78Rc26s=/filters:format(webp)/https%3A%2F%2Fcomplexbar.ru%2Fimages%2Fblog%2F271%2F752%D1%85480_1.jpg"
                    },
                    {
                        id: 109,
                        title: "Мінеральна вода (500 мл)",
                        price: 45,
                        category: "drinks",
                        desc: "Негазована / газована за вибором.",
                        isAvailable: true,
                        img_url: "https://petrovka-horeca.com.ua/images/detailed/25/vodaua-gazirovannaya-500.png"
                    },
                    {
                        id: 110,
                        title: "Чай чорний / зелений / трав'яний",
                        price: 55,
                        category: "drinks",
                        desc: "Великий чайник 500 мл, вибір сорту.",
                        isAvailable: true,
                        img_url: "https://thecoffeeshop.com.ua/wp-content/uploads/2022/06/tea-green-black-1200x550.jpg"
                    },
                    {
                        id: 111,
                        title: "Капучіно",
                        price: 65,
                        category: "drinks",
                        desc: "Подвійний еспресо з молочною піною, посипаний какао.",
                        isAvailable: true,
                        img_url: "https://www.starbucksathome.com/sites/default/files/2024-05/Recipe%20Refresh_Cappuccino_1842x1542_LS.png"
                    },
                    {
                        id: 112,
                        title: "Флет Вайт",
                        price: 70,
                        category: "drinks",
                        desc: "Подвійний ристретто з невеликою кількістю оксамитового молока.",
                        isAvailable: true,
                        img_url: "https://eu-central-1-jde.graphassets.com/AiQ00hd1mTUe8afHSH6YFz/output=format:webp/gK2mYXNoQhmSOd8aLR9w"
                    },
                    {
                        id: 113,
                        title: "Гарячий шоколад",
                        price: 80,
                        category: "drinks",
                        desc: "Щільний бельгійський какао з вершками та маршмелоу.",
                        isAvailable: true,
                        img_url: "https://klopotenko.com/wp-content/uploads/2024/11/garjachiy-schokolad-img-1000x600.jpg?v=1731934747"
                    },
                    {
                        id: 114,
                        title: "Апероль Шприц",
                        price: 145,
                        category: "alcohol",
                        desc: "Апероль, просекко, содова, слайс апельсину та лід.",
                        isAvailable: true,
                        img_url: "https://upload.wikimedia.org/wikipedia/commons/5/5f/Aperol_Spritz_aboard_Viking_Mariella.jpg"
                    },
                    {
                        id: 115,
                        title: "Негроні",
                        price: 160,
                        category: "alcohol",
                        desc: "Джин, Кампарі, солодкий вермут. Класичний аперитив на льоду.",
                        isAvailable: true,
                        img_url: "https://ua.inshaker.com/uploads/cocktail/hires/55/1629728461-%D0%9D%D0%B5%D0%B3%D1%80%D0%BE%D0%BD%D0%B8.jpg"
                    },
                    {
                        id: 116,
                        title: "Маргарита",
                        price: 155,
                        category: "alcohol",
                        desc: "Текіла, Трипл Сек, фреш лайму, сіль на бортику.",
                        isAvailable: true,
                        img_url: "https://mixthatdrink.com/wp-content/uploads/2023/03/classic-margarita-cocktail-540x720.jpg"
                    },
                    {
                        id: 117,
                        title: "Мохіто класичний",
                        price: 155,
                        category: "alcohol",
                        desc: "Білий ром, м'ята, лайм, цукровий сироп, содова.",
                        isAvailable: true,
                        img_url: "https://klopotenko.com/wp-content/uploads/2024/06/klasychnyy-mokhito-img-1000x600.jpg?v=1720540218"
                    },
                    {
                        id: 118,
                        title: "Вино червоне (бокал)",
                        price: 95,
                        category: "alcohol",
                        desc: "Сезонний вибір — Мальбек, Каберне, Шираз (підпитайте офіціанта).",
                        isAvailable: true,
                        img_url: "https://shop-chefsommelier.ru/images/detailed/1/46888.jpg"
                    },
                    {
                        id: 119,
                        title: "Вино біле (бокал)",
                        price: 90,
                        category: "alcohol",
                        desc: "Сезонний вибір — Совіньон Блан, Піно Гріджо, Рислінг.",
                        isAvailable: true,
                        img_url: "https://flagman.kh.ua/30334-thickbox_default/amber-kelikh-bilogo-vina-v-295ml-h-188sm-podupak-6sht-440255.jpg"
                    },
                    {
                        id: 120,
                        title: "Крафтове пиво (0.5 л)",
                        price: 110,
                        category: "alcohol",
                        desc: "Ротаційний вибір локальної пивоварні — запитайте актуальне.",
                        isAvailable: true,
                        img_url: "https://content2.rozetka.com.ua/goods/images/big_tile/581740446.jpg"
                    },
                    {
                        id: 121,
                        title: "Сангрія домашня (глечик 1 л)",
                        price: 295,
                        category: "alcohol",
                        desc: "Іспанська сангрія з червоного вина, цитрусових та гвоздики.",
                        isAvailable: true,
                        img_url: "https://smachno.blog/wp-content/uploads/2025/09/%D1%81%D0%B0%D0%BD%D0%B3%D1%80%D1%96%D1%8F-%D0%B2-%D0%B4%D0%BE%D0%BC%D0%B0%D1%88%D0%BD%D1%96%D1%85-%D1%83%D0%BC%D0%BE%D0%B2%D0%B0%D1%85.webp"
                    },
                    {
                        id: 122,
                        title: "Олд Фешнд",
                        price: 175,
                        category: "alcohol",
                        desc: "Бурбон, цукровий сироп, биттер Ангостура, цедра апельсину.",
                        isAvailable: true,
                        img_url: "https://upload.wikimedia.org/wikipedia/commons/5/56/15-09-26-RalfR-WLC-0141.jpg"
                    },
                    {
                        id: 123,
                        title: "Джин Тонік",
                        price: 150,
                        category: "alcohol",
                        desc: "Преміальний джин, тонік Fever-Tree, лайм, ялівець.",
                        isAvailable: true,
                        img_url: "https://bartenders.com.ua/wp-content/uploads/2024/04/gin-tonic-1200x1500.webp"
                    },
                    {
                        id: 124,
                        title: "Яйця Бенедикт",
                        price: 175,
                        category: "brunch",
                        desc: "Яйця-пашот на інгліш-маффіні з беконом та соусом Олландез.",
                        isAvailable: true,
                        img_url: "https://klopotenko.com/wp-content/uploads/2018/03/jajca-benedikt_siteWeb-1.jpg"
                    },
                    {
                        id: 125,
                        title: "Шакшука",
                        price: 155,
                        category: "brunch",
                        desc: "Яйця, томлені в гострому томатному соусі з перцем та зірою.",
                        isAvailable: true,
                        img_url: "https://s1.eda.ru/StaticContent/Photos/Upscaled/120131082509/150830163929/p_O.jpg"
                    },
                    {
                        id: 126,
                        title: "Авокадо-тост",
                        price: 165,
                        category: "brunch",
                        desc: "Хліб на заквасці, крем-авокадо, яйце-пашот, редис, мікрозелень.",
                        isAvailable: true,
                        img_url: "https://s1.eda.ru/StaticContent/Photos/e/b7/eb731a7eb3454f64a7f14f368aaf65f8.jpg"
                    },
                    {
                        id: 127,
                        title: "Французький тост бріош",
                        price: 145,
                        category: "brunch",
                        desc: "Бріош у яєчній суміші, ягідний кулі, збиті вершки, кленовий сироп.",
                        isAvailable: true,
                        img_url: "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3145993747236494798"
                    },
                    {
                        id: 128,
                        title: "Омлет з трюфелем та сиром",
                        price: 185,
                        category: "brunch",
                        desc: "Пухкий омлет із трюфельним маслом та пармезаном.",
                        isAvailable: true,
                        img_url: "https://goodwine.ua/wp-content/uploads/2024/10/cl8a3531.jpg"
                    },
                    {
                        id: 129,
                        title: "Вафлі з ягодами та кремом",
                        price: 145,
                        category: "brunch",
                        desc: "Хрусткі бельгійські вафлі, збиті вершки, свіжі ягоди, мед.",
                        isAvailable: true,
                        img_url: "https://i.ytimg.com/vi/4RLI9TrOLJk/maxresdefault.jpg"
                    },
                    {
                        id: 130,
                        title: "Панкейки з кленовим сиропом",
                        price: 135,
                        category: "brunch",
                        desc: "Пухкі американські панкейки з маслом та кленовим сиропом.",
                        isAvailable: true,
                        img_url: "https://cdn.%D0%BA%D1%83%D1%85%D0%BD%D1%8F.%D1%80%D1%84/recipe/aabd3bb4-7853-429d-87ef-58c799f552ba.webp"
                    }
                ]
            });
            console.log('Меню успішно імпортовано в PostgreSQL!');
        }
    }

    // Повертає тільки доступні страви для гостя (Фронтенд клієнта)
    async findAll(): Promise<any[]> {
        return this.prisma.menuItem.findMany({
            where: { isAvailable: true }
        });
    }

    // Повертає абсолютно всі страви (включаючи стоп-лист) для адміна/кухаря
    async findAllForAdmin(): Promise<any[]> {
        return this.prisma.menuItem.findMany();
    }

    // Пошук конкретної страви в БД за ID
    async findById(id: number): Promise<any> {
        const item = await this.prisma.menuItem.findUnique({
            where: { id: Number(id) }
        });
        if (!item) {
            throw new NotFoundException(`Страва з ID ${id} не знайдена в меню`);
        }
        return item;
    }

    // Метод для Кухаря — перемикання доступності (стоп-лист) прямо в БД
    async toggleAvailability(id: number): Promise<any> {
        const item = await this.findById(id); // Перевіряємо чи існує

        return this.prisma.menuItem.update({
            where: { id: Number(id) },
            data: { isAvailable: !item.isAvailable } // Інвертуємо статус
        });
    }
}