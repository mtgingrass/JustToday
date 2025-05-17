//
//  TipJarView.swift
//  SimpleHabit
//
//  Created by Mark Gingrass on 5/13/25.
//

import SwiftUI

struct TipJarView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 20) {
            HStack {
                Spacer()
                Button(action: {
                    dismiss()
                }) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.title2)
                        .foregroundColor(.gray)
                }
            }

            Text("Support the Developer")
                .font(.title)
                .fontWeight(.bold)
                .padding(.top)

            Text("If you enjoy using SimpleHabit, consider leaving a tip to support continued development. Thank you!")
                .font(.body)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Spacer()

            VStack(spacing: 16) {
                Button(action: {
                    // TODO: handle $0.99 tip
                }) {
                    Text("☕ Tip $0.99")
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(10)
                }

                Button(action: {
                    // TODO: handle $2.99 tip
                }) {
                    Text("🍕 Tip $2.99")
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green.opacity(0.1))
                        .cornerRadius(10)
                }

                Button(action: {
                    // TODO: handle $4.99 tip
                }) {
                    Text("🥇 Tip $4.99")
                        .fontWeight(.medium)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(10)
                }
            }
            .padding(.horizontal)

            Divider()
                .padding(.vertical)

            Text("Enjoying SimpleHabit?")
                .font(.headline)

            Text("Leave us a 5-star rating or share with a friend!")
                .font(.subheadline)
                .multilineTextAlignment(.center)

            HStack(spacing: 16) {
                Button("Facebook") {
                    // TODO: Share to Facebook
                }
                Button("X") {
                    // TODO: Share to X
                }
                Button("BlueSky") {
                    // TODO: Share to BlueSky
                }
                Button("Instagram") {
                    // TODO: Share to Instagram
                }
            }
            .font(.caption)
            .padding(.top, 4)

            Spacer()
        }
        .padding()
    }
}

#Preview {
    TipJarView()
}
