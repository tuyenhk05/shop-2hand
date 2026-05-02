# MỤC TIÊU DỰ ÁN (PROJECT GOAL)
Bạn là một chuyên gia lập trình React Native. Nhiệm vụ của bạn là hỗ trợ chuyển đổi giao diện của một trang web e-commerce bán quần áo secondhand từ React Web sang ứng dụng di động sử dụng React Native (Expo).

# BƯỚC 1: KHỞI TẠO DỰ ÁN (SETUP)
Nếu thư mục `mobile` đang trống, hãy thực hiện các lệnh sau để khởi tạo dự án Expo:
1. Chạy lệnh: `npx create-expo-app@latest ./` (bên trong thư mục mobile).
2. Cài đặt các thư viện điều hướng: `npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context`.
3. Cài đặt Axios để gọi API: `npm install axios`.

# BƯỚC 2: QUY TẮC CHUYỂN ĐỔI TỪ WEB SANG MOBILE (MIGRATION RULES)

Khi tôi cung cấp một component từ thư mục `frontend` (React Web), hãy viết lại component đó cho thư mục `mobile` theo các quy tắc nghiêm ngặt sau:

## 1. Chuyển đổi Thẻ HTML sang React Native Components
Tuyệt đối không sử dụng các thẻ HTML cơ bản (div, p, span, img...). Thay vào đó, hãy import từ `react-native`:
- `<div>`, `<section>`, `<main>` -> Chuyển thành `<View>` hoặc `<SafeAreaView>`.
- `<h1>` đến `<h6>`, `<p>`, `<span>` -> Chuyển thành `<Text>`.
- `<img>` -> Chuyển thành `<Image>` (lưu ý: bắt buộc phải có thuộc tính `source={{ uri: '...' }}` thay vì `src`).
- `<button>` -> Chuyển thành `<TouchableOpacity>` hoặc `<Pressable>`.
- `<input>` -> Chuyển thành `<TextInput>`.
- `<ul>`, `<li>`, `.map()` render danh sách -> Chuyển thành `<FlatList>` (ưu tiên cho danh sách sản phẩm) hoặc `<ScrollView>`.

## 2. Xử lý Styling (CSS / Tailwind)
- Web sử dụng Tailwind CSS. Khi chuyển sang Mobile, hãy viết lại các class Tailwind thành `StyleSheet.create({})` của React Native.
- Ví dụ: `flex-col justify-center items-center` -> `flexDirection: 'column', justifyContent: 'center', alignItems: 'center'`.
- Lưu ý: React Native sử dụng Flexbox mặc định, flex direction mặc định là `column` (không phải `row` như web).

## 3. Quản lý State và Hooks
- Giữ nguyên toàn bộ logic của `useState`, `useEffect`, `useMemo` và các custom hooks.
- Logic tính toán giỏ hàng, lọc sản phẩm secondhand giữ nguyên 100%.

## 4. Xử lý API Calls (Rất Quan Trọng)
- Mạng điện thoại (React Native) KHÔNG THỂ gọi API tới `http://localhost:5000`. `localhost` trên máy ảo mobile tự hiểu là chính cái điện thoại đó, chứ không phải máy tính chạy backend.
- Yêu cầu: Đổi tất cả các URL gọi API (fetch/axios) từ `localhost` sang địa chỉ IP mạng LAN của máy tính. 
- Hãy tạo một file `mobile/src/config/api.js` chứa biến `BASE_URL = 'http://<YOUR_LAN_IP>:5000/api'`.

## 5. Xử lý Navigation (Điều hướng)
- Web sử dụng `react-router-dom` (`<Link>`, `useNavigate`).
- Mobile bắt buộc phải sử dụng `@react-navigation/native` (`useNavigation()`, `navigation.navigate('ScreenName')`).

# VÍ DỤ CHUYỂN ĐỔI (EXAMPLE)

**Input (Web):**
```jsx
<div className="flex flex-row p-4">
  <img src={product.image} className="w-20 h-20" />
  <p className="text-lg font-bold">{product.name}</p>
</div>