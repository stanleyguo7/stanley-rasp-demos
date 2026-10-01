import AVFAudio
import SwiftUI
import WebKit

@main
struct DeerDodgeApp: App {
    init() {
        // Let the game's effects play through the device speaker, including in silent mode.
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.mixWithOthers])
        try? AVAudioSession.sharedInstance().setActive(true)
    }

    var body: some Scene {
        WindowGroup {
            GameWebView()
                .background(Color(red: 0.91, green: 0.97, blue: 0.81).ignoresSafeArea())
                .preferredColorScheme(.light)
                .statusBarHidden()
        }
    }
}

struct GameWebView: UIViewRepresentable {
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.91, green: 0.97, blue: 0.81, alpha: 1)
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        if let index = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "deer-dodge") {
            webView.loadFileURL(index, allowingReadAccessTo: index.deletingLastPathComponent())
        }
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}
}
