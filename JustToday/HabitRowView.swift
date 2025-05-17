import SwiftUI

struct HabitRowView: View {
    let title: String
    let goalLabel: String
    let completedAmount: Int
    let isJustForToday: Bool
    let record: Int

    var progress: Double {
        let target = Double(goalLabel.components(separatedBy: " ").first ?? "") ?? 0
        guard target > 0 else { return 0 }
        return min(Double(completedAmount) / target, 1.0)
    }

    var progressLabel: String {
        if isJustForToday {
            return completedAmount > 0 ? "Completed today" : "Not done yet"
        } else {
            return "\(completedAmount) / \(goalLabel)"
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .stroke(Color.gray.opacity(0.2), lineWidth: 6)
                        .frame(width: 60, height: 60)
                    Circle()
                        .trim(from: 0.0, to: progress)
                        .stroke(Color.accentColor, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                        .frame(width: 60, height: 60)
                    Text("\(Int(progress * 100))%")
                        .font(.caption)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                    Text(progressLabel)
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }

                Spacer()

                VStack(spacing: 2) {
                    Text("Record")
                        .font(.caption)
                        .foregroundColor(.gray)
                    Text("\(record)")
                        .font(.subheadline)
                        .fontWeight(.medium)
                }
            }
            Text("Did you complete this task today?")
                .font(.footnote)
                .foregroundColor(.primary)
            HStack {
                Button(action: {
                    print("✅ Completed '\(title)' today")
                }) {
                    Text("Completed")
                        .font(.footnote)
                        .foregroundColor(.white)
                        .padding(.vertical, 6)
                        .frame(maxWidth: .infinity)
                        .background(Color.green)
                        .cornerRadius(8)
                }

                Button(action: {
                    print("⛔️ Skip '\(title)' today")
                }) {
                    Text("Skipped")
                        .font(.footnote)
                        .foregroundColor(.white)
                        .padding(.vertical, 6)
                        .frame(maxWidth: .infinity)
                        .background(Color.red)
                        .cornerRadius(8)
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
    }
}

#Preview {
    VStack(spacing: 20) {
        HabitRowView(title: "Workout", goalLabel: "10 weeks", completedAmount: 6, isJustForToday: false, record: 8)
        HabitRowView(title: "Read", goalLabel: "30 days", completedAmount: 18, isJustForToday: false, record: 22)
        HabitRowView(title: "Meditate", goalLabel: "1 day", completedAmount: 1, isJustForToday: true, record: 5)
    }
    .padding()
}
