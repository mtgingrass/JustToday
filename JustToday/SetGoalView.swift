//
//  SetGoalView.swift
//  SimpleHabit
//
//  Created by Mark Gingrass on 5/17/25.
//

import SwiftUI

struct SetGoalView: View {
    var onSelect: (GoalConfig) -> Void
    @Environment(\.dismiss) var dismiss
    @State private var selectedDays: Set<Weekday> = []
    @State private var isJustForToday = false
    @State private var goalType: GoalType = .weeks
    @State private var goalAmount: String = "10"
    @State private var isLenient = false
    @State private var showLenientInfo = false

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Choose Goal Type")) {
                    Toggle("Just for Today", isOn: $isJustForToday)
                        .onChange(of: isJustForToday) {
                            if isJustForToday {
                                selectedDays.removeAll()
                            }
                        }

                    if !isJustForToday {
                        VStack(alignment: .leading) {
                            Text("Select days to complete this habit")
                                .font(.subheadline)
                                .padding(.bottom, 5)

                            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4)) {
                                ForEach(Weekday.allCases) { day in
                                    Button(action: {
                                        if selectedDays.contains(day) {
                                            selectedDays.remove(day)
                                        } else {
                                            selectedDays.insert(day)
                                        }
                                    }) {
                                        Text(day.shortName)
                                            .fontWeight(.medium)
                                            .frame(width: 40, height: 40)
                                            .background(
                                                RoundedRectangle(cornerRadius: 8)
                                                    .fill(selectedDays.contains(day) ? Color.blue : Color.gray.opacity(0.2))
                                            )
                                            .foregroundColor(selectedDays.contains(day) ? .white : .primary)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                            HStack {
                                Toggle("Lenient tracking", isOn: $isLenient)
                                    .font(.subheadline)

                                Image(systemName: "info.circle")
                                    .foregroundColor(.blue)
                                    .onTapGesture {
                                        showLenientInfo = true
                                    }
                            }
                            .padding(.top, 8)
                        }
                        .padding(.vertical)
                    }
                }

                if !isJustForToday {
                    Section(header: Text("Goal Target")) {
                        Picker("Goal Type", selection: $goalType) {
                            ForEach(GoalType.allCases) { type in
                                Text(type.label).tag(type)
                            }
                        }
                        .pickerStyle(SegmentedPickerStyle())

                        TextField("Enter number of \(goalType == .weeks ? "weeks" : "days")", text: $goalAmount)
                            .keyboardType(.numberPad)
                    }
                }

                Section {
                    Button("Set Goal") {
                        let target = Int(goalAmount) ?? 0
                        let goal = isJustForToday ?
                            GoalConfig(isJustForToday: true, daysOfWeek: [], targetCountPerWeek: 1, goalType: goalType, goalTarget: target, isLenient: false) :
                            GoalConfig(isJustForToday: false, daysOfWeek: Array(selectedDays), targetCountPerWeek: selectedDays.count, goalType: goalType, goalTarget: target, isLenient: isLenient)

                        onSelect(goal)
                        dismiss()
                    }
                    .disabled(!isJustForToday && selectedDays.isEmpty)
                    .frame(maxWidth: .infinity, alignment: .center)
                }

                Section {
                    Button("Clear Goal") {
                        onSelect(.cleared)
                        dismiss()
                    }
                    .foregroundColor(.red)
                }
            }
            .navigationTitle("Set Weekly Goal")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                    }
                }
            }
            .alert(isPresented: $showLenientInfo) {
                Alert(
                    title: Text("What is Lenient Tracking?"),
                    message: Text("With lenient tracking, it doesn't matter which days you do the habit. As long as you complete it the desired number of times in a week, it's counted as successful."),
                    dismissButton: .default(Text("Got it!"))
                )
            }
        }
    }
}

struct GoalConfig {
    var isJustForToday: Bool
    var daysOfWeek: [Weekday]
    var targetCountPerWeek: Int
    var goalType: GoalType
    var goalTarget: Int
    var isLenient: Bool

    static let cleared = GoalConfig(isJustForToday: false, daysOfWeek: [], targetCountPerWeek: 0, goalType: .weeks, goalTarget: 0, isLenient: false)
}

enum GoalType: String, CaseIterable, Identifiable {
    case weeks, days
    var id: String { rawValue }
    var label: String {
        switch self {
        case .weeks: return "Weeks"
        case .days: return "Total Days"
        }
    }
}

enum Weekday: String, CaseIterable, Identifiable {
    case sunday, monday, tuesday, wednesday, thursday, friday, saturday

    var id: String { rawValue }

    var shortName: String {
        switch self {
        case .sunday: return "Sun"
        case .monday: return "Mon"
        case .tuesday: return "Tue"
        case .wednesday: return "Wed"
        case .thursday: return "Thu"
        case .friday: return "Fri"
        case .saturday: return "Sat"
        }
    }
}

#Preview {
    SetGoalView { config in
        print("Selected goal config: \(config)")
    }
}
