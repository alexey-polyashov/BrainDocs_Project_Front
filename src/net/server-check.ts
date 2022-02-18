import { ElLoading } from "element-plus";
import axiosInstance from "./axios-instance";

export function useServerCheck() {
  setInterval(testServerConnection, 1000 * 60 * 20);
  testServerConnection();

  function testServerConnection() {
    console.log('performing server check...');
    let loading: ReturnType<typeof ElLoading.service> | null = null;
    const timeoutVal = setTimeout(() => {
      loading = ElLoading.service({
        lock: true,
        text: 'Waiting for server to load... It may take about 30 seconds, thanks.',
        background: 'rgba(0, 0, 0, 0.7)',
      });
    }, 1000);
    axiosInstance
      .get('/test', {
        timeout: 0
      })
      .then(res => {
        if (loading) {
          loading.close();
        }
        clearTimeout(timeoutVal);
        console.log('server responded');
      });
  }
}
