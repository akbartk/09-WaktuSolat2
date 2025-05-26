// Script untuk memaksa refresh stylesheet CSS
export function forceStylesheetReload() {
  // Dapatkan semua stylesheet
  const links = document.getElementsByTagName('link');
  
  // Tambahkan timestamp ke URL stylesheet untuk memaksa browser me-reload
  for (let i = 0; i < links.length; i++) {
    if (links[i].rel === 'stylesheet') {
      const href = links[i].getAttribute('href');
      if (href) {
        const url = new URL(href, window.location.href);
        url.searchParams.set('forceReload', Date.now());
        links[i].setAttribute('href', url.toString());
      }
    }
  }
  
  console.log('Stylesheet telah di-refresh');
}
