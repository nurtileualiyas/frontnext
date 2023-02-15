export class BannerService {

    getBanners() {
        return fetch('http://almaback.almatv.kz/api/banners', { headers: { 'Cache-Control': 'no-cache' } }).then((res) => res.json());
    }

}
