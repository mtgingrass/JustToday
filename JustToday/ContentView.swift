import SwiftUI

struct Habit: Identifiable, Equatable {
    let id = UUID()
    var title: String
    var goalLabel: String
    var completedAmount: Int
    var isJustForToday: Bool
    var record: Int
}

enum ActiveSheet: Identifiable {
    case tipJar, about, setGoal(Habit)

    var id: String {
        switch self {
        case .tipJar: return "tipJar"
        case .about: return "about"
        case .setGoal(let habit): return habit.id.uuidString
        }
    }
}

struct ContentView: View {
    @AppStorage("isDarkMode") private var isDarkMode = false
    @State private var habits: [Habit] = [
        Habit(title: "Workout", goalLabel: "10 weeks", completedAmount: 6, isJustForToday: false, record: 8),
        Habit(title: "Read", goalLabel: "30 days", completedAmount: 20, isJustForToday: false, record: 25),
        Habit(title: "Meditate", goalLabel: "7 days", completedAmount: 5, isJustForToday: false, record: 10)
    ]
    @State private var activeSheet: ActiveSheet?

    var body: some View {
        NavigationStack {
            List {
                ForEach(habits) { habit in
                    HabitRowView(
                        title: habit.title,
                        goalLabel: habit.goalLabel,
                        completedAmount: habit.completedAmount,
                        isJustForToday: habit.isJustForToday,
                        record: habit.record,
                        onResetRecord: {
                            if let index = habits.firstIndex(of: habit) {
                                habits[index].completedAmount = 0
                            }
                        },
                        onResetStreak: {
                            if let index = habits.firstIndex(of: habit) {
                                habits[index].record = 0
                            }
                        },
                        onSetGoal: {
                            activeSheet = .setGoal(habit)
                        }
                    )
                }
            }
            .listStyle(.plain)
            .navigationTitle("Habits")
            .toolbar { // This should be on the NavigationStack's content
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: {
                        isDarkMode.toggle()
                    }) {
                        Image(systemName: isDarkMode ? "moon.fill" : "sun.max")
                    }
                }

                ToolbarItemGroup(placement: .navigationBarTrailing) {
                    Button(action: {
                        activeSheet = .tipJar
                    }) {
                        Image(systemName: "gift")
                    }
                    
                    Menu {
                        Button("📘 About This App") {
                            activeSheet = .about
                        }
                        Button("💰 Tip Jar") {
                            activeSheet = .tipJar
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
        .preferredColorScheme(isDarkMode ? .dark : .light)
        .sheet(item: $activeSheet) { sheet in
            switch sheet {
            case .tipJar:
                TipJarView()
            case .about:
                AboutAppView()
            case .setGoal(let habit):
                SetGoalView { config in
                    if let index = habits.firstIndex(of: habit) {
                        habits[index].goalLabel = config.isJustForToday
                            ? "Just for Today"
                            : "\(config.goalTarget) \(config.goalType == .weeks ? "weeks" : "days")"
                        habits[index].isJustForToday = config.isJustForToday
                    }
                    activeSheet = nil
                }
            }
        }
    }
}

#Preview {
    NavigationStack {
        ContentView()
    }
}
