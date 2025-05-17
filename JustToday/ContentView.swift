import SwiftUI

struct ContentView: View {
    @State private var showTipJar = false
    @State private var showAbout = false
    @AppStorage("isDarkMode") private var isDarkMode = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    HabitRowView(title: "Workout", goalLabel: "10 weeks", completedAmount: 6, isJustForToday: false, record: 8)
                    HabitRowView(title: "Read", goalLabel: "30 days", completedAmount: 20, isJustForToday: false, record: 25)
                    HabitRowView(title: "Meditate", goalLabel: "7 days", completedAmount: 5, isJustForToday: false, record: 10)
                }
                .padding()
            }
            .navigationTitle("Habits")
        }
        .preferredColorScheme(isDarkMode ? .dark : .light)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button(action: {
                    isDarkMode.toggle()
                }) {
                    Image(systemName: isDarkMode ? "moon.fill" : "sun.max")
                }
            }

            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: {
                    showTipJar = true
                }) {
                    Image(systemName: "gift")
                }
            }

            ToolbarItem(placement: .navigationBarTrailing) {
                Menu {
                    Button("📘 About This App") {
                        showAbout = true
                    }
                    Button("💰 Tip Jar") {
                        showTipJar = true
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .sheet(isPresented: $showTipJar) {
            TipJarView()
        }
        .sheet(isPresented: $showAbout) {
            AboutAppView()
        }
    }
}

#Preview {
    NavigationStack {
        ContentView()
    }
}
